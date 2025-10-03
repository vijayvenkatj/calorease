import { z } from 'zod'
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, weeklyProgress, foodLogs, waterIntakeLogs } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'

const t = initTRPC.create()

// Helper function to get Monday of the week for a given date
function getMondayOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

// Helper function to calculate weekly progress
async function calculateWeeklyProgress(userId: string, weekStartDate: string) {
  const weekStart = new Date(weekStartDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Get food logs for the week
  const logs = await db
    .select()
    .from(foodLogs)
    .where(and(
      eq(foodLogs.userId, userId),
      gte(foodLogs.loggedAt, weekStart),
      lt(foodLogs.loggedAt, weekEnd)
    ))

  // Get unique dates with logs
  const uniqueDates = new Set(
    logs.map(log => new Date(log.loggedAt).toISOString().split('T')[0])
  )
  const daysLogged = uniqueDates.size

  // Calculate nutrition totals
  const totals = logs.reduce(
    (acc, log) => ({
      totalCalories: acc.totalCalories + Number(log.calories || 0),
      totalProtein: acc.totalProtein + Number(log.protein || 0),
      totalCarbs: acc.totalCarbs + Number(log.carbs || 0),
      totalFats: acc.totalFats + Number(log.fats || 0),
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    }
  )

  // Get water intake for the week
  const waterResult = await db
    .select({
      totalWaterMl: sql<number>`COALESCE(SUM(${waterIntakeLogs.amountMl}), 0)::integer`,
    })
    .from(waterIntakeLogs)
    .where(and(
      eq(waterIntakeLogs.userId, userId),
      gte(waterIntakeLogs.loggedAt, weekStart),
      lt(waterIntakeLogs.loggedAt, weekEnd)
    ))

  const totalWaterMl = waterResult[0]?.totalWaterMl || 0

  return {
    daysLogged,
    totalCalories: String(totals.totalCalories),
    totalProtein: String(totals.totalProtein),
    totalCarbs: String(totals.totalCarbs),
    totalFats: String(totals.totalFats),
    totalWaterMl,
  }
}

export const progressRouter = t.router({
  // Get weekly progress for current week or specific week
  getWeeklyProgress: t.procedure
    .input(z.object({
      weekStartDate: z.string().optional(), // ISO date string (YYYY-MM-DD) - Monday of the week
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view weekly progress',
          })
        }

        const weekStartDate = input.weekStartDate || getMondayOfWeek(new Date())

        // Try to get existing progress record
        const existingProgress = await db
          .select()
          .from(weeklyProgress)
          .where(and(
            eq(weeklyProgress.userId, user.id),
            eq(weeklyProgress.weekStartDate, weekStartDate)
          ))
          .limit(1)

        if (existingProgress.length > 0) {
          return existingProgress[0]
        }

        // Calculate and create new progress record
        const progressData = await calculateWeeklyProgress(user.id, weekStartDate)

        const [newProgress] = await db
          .insert(weeklyProgress)
          .values({
            userId: user.id,
            weekStartDate,
            ...progressData,
          })
          .returning()

        return newProgress
      } catch (error) {
        console.error('Error fetching weekly progress:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch weekly progress',
        })
      }
    }),

  // Update/recalculate weekly progress (called after adding logs)
  updateWeeklyProgress: t.procedure
    .input(z.object({
      weekStartDate: z.string().optional(), // ISO date string (YYYY-MM-DD)
    }))
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to update weekly progress',
          })
        }

        const weekStartDate = input.weekStartDate || getMondayOfWeek(new Date())

        // Calculate current progress
        const progressData = await calculateWeeklyProgress(user.id, weekStartDate)

        // Try to get existing progress record
        const existingProgress = await db
          .select()
          .from(weeklyProgress)
          .where(and(
            eq(weeklyProgress.userId, user.id),
            eq(weeklyProgress.weekStartDate, weekStartDate)
          ))
          .limit(1)

        if (existingProgress.length === 0) {
          // Create new record
          const [newProgress] = await db
            .insert(weeklyProgress)
            .values({
              userId: user.id,
              weekStartDate,
              ...progressData,
            })
            .returning()

          return newProgress
        } else {
          // Update existing record
          const [updatedProgress] = await db
            .update(weeklyProgress)
            .set({
              ...progressData,
              updatedAt: new Date(),
            })
            .where(and(
              eq(weeklyProgress.userId, user.id),
              eq(weeklyProgress.weekStartDate, weekStartDate)
            ))
            .returning()

          return updatedProgress
        }
      } catch (error) {
        console.error('Error updating weekly progress:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update weekly progress',
        })
      }
    }),

  // Get progress history (last N weeks)
  getProgressHistory: t.procedure
    .input(z.object({
      weeks: z.number().min(1).max(52).default(4), // Number of weeks to fetch
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view progress history',
          })
        }

        const history = await db
          .select()
          .from(weeklyProgress)
          .where(eq(weeklyProgress.userId, user.id))
          .orderBy(desc(weeklyProgress.weekStartDate))
          .limit(input.weeks)

        return history
      } catch (error) {
        console.error('Error fetching progress history:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch progress history',
        })
      }
    }),
})

