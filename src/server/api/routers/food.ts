import { z } from 'zod'
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, foodLogs, insertFoodLogSchema, userStreaks, weeklyProgress } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'

const t = initTRPC.create()

// Helper function to get Monday of the week for a given date
function getMondayOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

// Helper function to update user streak after adding a food log
async function updateUserStreak(userId: string) {
  // Get all unique dates with food logs for this user, sorted descending
  const logs = await db
    .select({
      date: sql<string>`DATE(${foodLogs.loggedAt})`,
    })
    .from(foodLogs)
    .where(eq(foodLogs.userId, userId))
    .groupBy(sql`DATE(${foodLogs.loggedAt})`)
    .orderBy(desc(sql`DATE(${foodLogs.loggedAt})`))

  if (logs.length === 0) return

  const dates = logs.map(log => log.date)
  const lastLogDate = dates[0]
  
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const lastLog = new Date(lastLogDate)
  lastLog.setHours(0, 0, 0, 0)
  
  if (lastLog.getTime() === today.getTime() || lastLog.getTime() === yesterday.getTime()) {
    let checkDate = new Date(lastLog)
    
    for (const dateStr of dates) {
      const logDate = new Date(dateStr)
      logDate.setHours(0, 0, 0, 0)
      
      if (logDate.getTime() === checkDate.getTime()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (logDate.getTime() < checkDate.getTime()) {
        break
      }
    }
  }
  
  let longestStreak = 0
  let tempStreak = 1
  
  for (let i = 0; i < dates.length - 1; i++) {
    const currentDate = new Date(dates[i])
    const nextDate = new Date(dates[i + 1])
    
    currentDate.setHours(0, 0, 0, 0)
    nextDate.setHours(0, 0, 0, 0)
    
    const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (dayDiff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  const existingStreak = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1)

  if (existingStreak.length === 0) {
    await db.insert(userStreaks).values({
      userId,
      currentStreak,
      longestStreak,
      lastLogDate,
    })
  } else {
    await db
      .update(userStreaks)
      .set({
        currentStreak,
        longestStreak,
        lastLogDate,
        updatedAt: new Date(),
      })
      .where(eq(userStreaks.userId, userId))
  }
}

// Helper function to update weekly progress after adding a food log
async function updateWeeklyProgressForUser(userId: string, weekStartDate: string) {
  const weekStart = new Date(weekStartDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const logs = await db
    .select()
    .from(foodLogs)
    .where(and(
      eq(foodLogs.userId, userId),
      gte(foodLogs.loggedAt, weekStart),
      lt(foodLogs.loggedAt, weekEnd)
    ))

  const uniqueDates = new Set(
    logs.map(log => new Date(log.loggedAt).toISOString().split('T')[0])
  )
  const daysLogged = uniqueDates.size

  const totals = logs.reduce(
    (acc, log) => ({
      totalCalories: acc.totalCalories + Number(log.calories || 0),
      totalProtein: acc.totalProtein + Number(log.protein || 0),
      totalCarbs: acc.totalCarbs + Number(log.carbs || 0),
      totalFats: acc.totalFats + Number(log.fats || 0),
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
  )

  const existingProgress = await db
    .select()
    .from(weeklyProgress)
    .where(and(
      eq(weeklyProgress.userId, userId),
      eq(weeklyProgress.weekStartDate, weekStartDate)
    ))
    .limit(1)

  if (existingProgress.length === 0) {
    await db.insert(weeklyProgress).values({
      userId,
      weekStartDate,
      daysLogged,
      totalCalories: String(totals.totalCalories),
      totalProtein: String(totals.totalProtein),
      totalCarbs: String(totals.totalCarbs),
      totalFats: String(totals.totalFats),
      totalWaterMl: 0,
    })
  } else {
    await db
      .update(weeklyProgress)
      .set({
        daysLogged,
        totalCalories: String(totals.totalCalories),
        totalProtein: String(totals.totalProtein),
        totalCarbs: String(totals.totalCarbs),
        totalFats: String(totals.totalFats),
        updatedAt: new Date(),
      })
      .where(and(
        eq(weeklyProgress.userId, userId),
        eq(weeklyProgress.weekStartDate, weekStartDate)
      ))
  }
}

export const foodRouter = t.router({
  // Get food logs for current user (optionally filter by date)
  getLogs: t.procedure
    .input(z.object({
      date: z.string().optional(), // ISO date string (YYYY-MM-DD)
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view food logs',
          })
        }

        let whereConditions = eq(foodLogs.userId, user.id)

        // If date is provided, filter by that date
        if (input.date) {
          const startOfDay = new Date(`${input.date}T00:00:00.000Z`)
          const endOfDay = new Date(`${input.date}T23:59:59.999Z`)
          
          whereConditions = and(
            eq(foodLogs.userId, user.id),
            gte(foodLogs.loggedAt, startOfDay),
            lt(foodLogs.loggedAt, endOfDay)
          )!
        }

        const logs = await db
          .select()
          .from(foodLogs)
          .where(whereConditions)
          .orderBy(desc(foodLogs.loggedAt))

        return logs
      } catch (error) {
        console.error('Error fetching food logs:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch food logs',
        })
      }
    }),

  // Add a new food log
  addLog: t.procedure
    .input(insertFoodLogSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to add food logs',
          })
        }

        const [newLog] = await db
          .insert(foodLogs)
          .values({
            userId: user.id,
            mealType: input.mealType,
            foodName: input.foodName,
            calories: String(input.calories),
            protein: input.protein ? String(input.protein) : '0',
            carbs: input.carbs ? String(input.carbs) : '0',
            fats: input.fats ? String(input.fats) : '0',
          })
          .returning()

        // Update streak and weekly progress asynchronously
        const weekStartDate = getMondayOfWeek(new Date())
        await Promise.all([
          updateUserStreak(user.id),
          updateWeeklyProgressForUser(user.id, weekStartDate),
        ])

        return newLog
      } catch (error) {
        console.error('Error adding food log:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add food log',
        })
      }
    }),

  // Update an existing food log
  updateLog: t.procedure
    .input(z.object({
      id: z.string().uuid(),
      data: insertFoodLogSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to update food logs',
          })
        }

        // Verify the log belongs to the current user
        const existingLog = await db
          .select()
          .from(foodLogs)
          .where(and(
            eq(foodLogs.id, input.id),
            eq(foodLogs.userId, user.id)
          ))
          .limit(1)

        if (existingLog.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Food log not found',
          })
        }

        const [updatedLog] = await db
          .update(foodLogs)
          .set({
            mealType: input.data.mealType,
            foodName: input.data.foodName,
            calories: String(input.data.calories),
            protein: input.data.protein ? String(input.data.protein) : '0',
            carbs: input.data.carbs ? String(input.data.carbs) : '0',
            fats: input.data.fats ? String(input.data.fats) : '0',
          })
          .where(eq(foodLogs.id, input.id))
          .returning()

        // Update weekly progress after modification
        const weekStartDate = getMondayOfWeek(new Date())
        await updateWeeklyProgressForUser(user.id, weekStartDate)

        return updatedLog
      } catch (error) {
        console.error('Error updating food log:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update food log',
        })
      }
    }),

  // Delete a food log
  deleteLog: t.procedure
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
            message: 'Must be logged in to delete food logs',
          })
        }

        // Verify the log belongs to the current user and delete it
        const [deletedLog] = await db
          .delete(foodLogs)
          .where(and(
            eq(foodLogs.id, input.id),
            eq(foodLogs.userId, user.id)
          ))
          .returning()

        if (!deletedLog) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Food log not found',
          })
        }

        // Update streak and weekly progress after deletion
        const weekStartDate = getMondayOfWeek(new Date())
        await Promise.all([
          updateUserStreak(user.id),
          updateWeeklyProgressForUser(user.id, weekStartDate),
        ])

        return { success: true, deletedLog }
      } catch (error) {
        console.error('Error deleting food log:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete food log',
        })
      }
    }),

  // Get daily nutrition summary
  getDailySummary: t.procedure
    .input(z.object({
      date: z.string().optional(), // ISO date string (YYYY-MM-DD)
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view nutrition summary',
          })
        }

        const targetDate = input.date || new Date().toISOString().split('T')[0]
        const startOfDay = new Date(`${targetDate}T00:00:00.000Z`)
        const endOfDay = new Date(`${targetDate}T23:59:59.999Z`)

        const logs = await db
          .select()
          .from(foodLogs)
          .where(and(
            eq(foodLogs.userId, user.id),
            gte(foodLogs.loggedAt, startOfDay),
            lt(foodLogs.loggedAt, endOfDay)
          ))

        // Calculate totals
        const summary = logs.reduce(
          (acc, log) => ({
            totalCalories: acc.totalCalories + Number(log.calories || 0),
            totalProtein: acc.totalProtein + Number(log.protein || 0),
            totalCarbs: acc.totalCarbs + Number(log.carbs || 0),
            totalFats: acc.totalFats + Number(log.fats || 0),
            logCount: acc.logCount + 1,
          }),
          {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
            logCount: 0,
          }
        )

        return {
          date: targetDate,
          ...summary,
          logs: logs.length,
        }
      } catch (error) {
        console.error('Error fetching daily summary:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch daily summary',
        })
      }
    }),
})
