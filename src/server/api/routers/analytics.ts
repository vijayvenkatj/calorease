import { z } from 'zod'
import { and, eq, gte, sql } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, weightLogs, insertWeightLogSchema, foodLogs, profiles } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'

const t = initTRPC.create()

// Helper function to get date range (last N days)
function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

export const analyticsRouter = t.router({
  // Add weight log
  addWeightLog: t.procedure
    .input(insertWeightLogSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to add weight logs',
          })
        }

        const currentDate = new Date().toISOString().split('T')[0]

        const [newLog] = await db
          .insert(weightLogs)
          .values({
            userId: user.id,
            weight: String(input.weight),
            notes: input.notes,
            date: currentDate,
          })
          .returning()

        // Also update the user's current weight in profile to keep it in sync
        try {
          await db
            .update(profiles)
            .set({ weight: String(input.weight), updatedAt: new Date() })
            .where(eq(profiles.id, user.id))
        } catch (err) {
          // Non-fatal: log error but continue returning the weight log result
          console.error('Failed to sync profile weight after weight log:', err)
        }

        return newLog
      } catch (error) {
        console.error('Error adding weight log:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add weight log',
        })
      }
    }),

  // Get weight logs for date range
  getWeightLogs: t.procedure
    .input(z.object({
      days: z.number().min(1).max(365).default(7),
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view weight logs',
          })
        }

        const { startDate } = getDateRange(input.days)

        const logs = await db
          .select()
          .from(weightLogs)
          .where(and(
            eq(weightLogs.userId, user.id),
            gte(weightLogs.date, startDate)
          ))
          .orderBy(weightLogs.date)

        return logs
      } catch (error) {
        console.error('Error fetching weight logs:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch weight logs',
        })
      }
    }),

  // Get daily calorie intake for date range
  getDailyCalories: t.procedure
    .input(z.object({
      days: z.number().min(1).max(365).default(7),
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view calorie data',
          })
        }

        const { startDate } = getDateRange(input.days)

        // Get all food logs in date range
        const logs = await db
          .select({
            date: sql<string>`DATE(${foodLogs.loggedAt})`,
            calories: sql<number>`COALESCE(SUM(${foodLogs.calories}::numeric), 0)::numeric`,
          })
          .from(foodLogs)
          .where(and(
            eq(foodLogs.userId, user.id),
            gte(sql`DATE(${foodLogs.loggedAt})`, startDate)
          ))
          .groupBy(sql`DATE(${foodLogs.loggedAt})`)
          .orderBy(sql`DATE(${foodLogs.loggedAt})`)

        return logs.map(log => ({
          date: log.date,
          calories: Number(log.calories),
        }))
      } catch (error) {
        console.error('Error fetching daily calories:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch daily calories',
        })
      }
    }),

  // Get analytics summary
  getAnalytics: t.procedure
    .input(z.object({
      days: z.number().min(7).max(365).default(7),
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view analytics',
          })
        }

        // Fetch user profile to get their goal
        const userProfile = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, user.id))
          .limit(1)

        if (!userProfile || userProfile.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          })
        }

        const profile = userProfile[0]

        // Determine target weekly weight change based on user's goal
        let targetWeeklyWeightChange = 0 // maintain_weight
        
        switch (profile.goals) {
          case 'lose_weight':
            targetWeeklyWeightChange = -0.5 // Lose 0.5 kg per week (sustainable)
            break
          case 'gain_muscle':
          case 'increase_strength':
            targetWeeklyWeightChange = 0.25 // Gain 0.25 kg per week (lean muscle gain)
            break
          case 'maintain_weight':
          case 'improve_health':
          default:
            targetWeeklyWeightChange = 0 // Maintain current weight
            break
        }

        const { startDate } = getDateRange(input.days)

        // Get weight logs
        const weightLogsData = await db
          .select()
          .from(weightLogs)
          .where(and(
            eq(weightLogs.userId, user.id),
            gte(weightLogs.date, startDate)
          ))
          .orderBy(weightLogs.date)

        // Get daily calories
        const caloriesData = await db
          .select({
            date: sql<string>`DATE(${foodLogs.loggedAt})`,
            calories: sql<number>`COALESCE(SUM(${foodLogs.calories}::numeric), 0)::numeric`,
          })
          .from(foodLogs)
          .where(and(
            eq(foodLogs.userId, user.id),
            gte(sql`DATE(${foodLogs.loggedAt})`, startDate)
          ))
          .groupBy(sql`DATE(${foodLogs.loggedAt})`)
          .orderBy(sql`DATE(${foodLogs.loggedAt})`)

        const dailyCalories = caloriesData.map(log => ({
          date: log.date,
          calories: Number(log.calories),
        }))

        // Calculate metrics
        const daysLogged = dailyCalories.length
        
        // 1. Average daily calories
        const totalCalories = dailyCalories.reduce((sum, day) => sum + day.calories, 0)
        const avgDailyCalories = daysLogged > 0 ? Math.round(totalCalories / daysLogged) : 0

        // 2. Total weight change
        let totalWeightChange = 0
        let startWeight = 0
        let endWeight = 0
        
        if (weightLogsData.length >= 2) {
          startWeight = Number(weightLogsData[0].weight)
          endWeight = Number(weightLogsData[weightLogsData.length - 1].weight)
          totalWeightChange = Number((endWeight - startWeight).toFixed(2))
        }

        // 3. Maintenance calories (TDEE - Total Daily Energy Expenditure)
        // Formula: avgCalories - (weightChange * 7700 / daysLogged)
        // 7700 calories ≈ 1 kg of body weight
        // If weight decreased (negative), deficit per day = positive value to add back
        // If weight increased (positive), surplus per day = negative value to subtract
        let maintenanceCalories = avgDailyCalories
        let isDataRealistic = true
        
        if (daysLogged >= 7 && weightLogsData.length >= 2) {
          // Calculate the daily calorie deficit/surplus based on weight change
          const dailyEnergyImbalance = (totalWeightChange * 7700) / daysLogged
          
          // Safety check: If the calculated imbalance is unrealistic (>3000 cal/day)
          const maxRealisticDeficit = 1500
          const maxRealisticSurplus = 1000
          
          if (Math.abs(dailyEnergyImbalance) > 3000) {
            isDataRealistic = false
            maintenanceCalories = avgDailyCalories
          } else {
            const clampedImbalance = Math.max(
              -maxRealisticSurplus,
              Math.min(maxRealisticDeficit, dailyEnergyImbalance)
            )
            maintenanceCalories = Math.round(avgDailyCalories - clampedImbalance)
          }
          
          maintenanceCalories = Math.max(1200, Math.min(4000, maintenanceCalories))
        }

        const dailyCalorieAdjustment = (targetWeeklyWeightChange * 7700) / 7
        let goalCalories = Math.round(maintenanceCalories + dailyCalorieAdjustment)
       
        goalCalories = Math.max(1200, Math.min(4000, goalCalories))

        return {
          daysLogged,
          avgDailyCalories,
          totalWeightChange,
          startWeight,
          endWeight,
          maintenanceCalories,
          goalCalories,
          targetWeeklyWeightChange, // From user's profile goal
          userGoal: profile.goals, // Include the actual goal name
          hasEnoughData: daysLogged >= 7 && weightLogsData.length >= 2,
          isDataRealistic, // Flag to warn user about unrealistic data
          weightLogs: weightLogsData.map(log => ({
            date: log.date,
            weight: Number(log.weight),
          })),
          dailyCalories,
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch analytics',
        })
      }
    }),

  // Delete weight log
  deleteWeightLog: t.procedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to delete weight logs',
          })
        }

        const [deletedLog] = await db
          .delete(weightLogs)
          .where(and(
            eq(weightLogs.id, input.id),
            eq(weightLogs.userId, user.id)
          ))
          .returning()

        if (!deletedLog) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Weight log not found',
          })
        }

        return { success: true, deletedLog }
      } catch (error) {
        console.error('Error deleting weight log:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete weight log',
        })
      }
    }),
})

