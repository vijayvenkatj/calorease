import { z } from 'zod'
import { and, desc, eq, sql } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, userStreaks, foodLogs } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'

const t = initTRPC.create()

// Helper function to calculate streak based on food logs
async function calculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number; lastLogDate: string | null }> {
  // Get all unique dates with food logs for this user, sorted descending
  const logs = await db
    .select({
      date: sql<string>`DATE(${foodLogs.loggedAt})`,
    })
    .from(foodLogs)
    .where(eq(foodLogs.userId, userId))
    .groupBy(sql`DATE(${foodLogs.loggedAt})`)
    .orderBy(desc(sql`DATE(${foodLogs.loggedAt})`))

  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastLogDate: null }
  }

  const dates = logs.map(log => log.date)
  const lastLogDate = dates[0]
  
  // Calculate current streak (must include today or yesterday)
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const lastLog = new Date(lastLogDate)
  lastLog.setHours(0, 0, 0, 0)
  
  // Only count current streak if last log was today or yesterday
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
  
  // Calculate longest streak
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
  
  longestStreak = Math.max(longestStreak, tempStreak)
  longestStreak = Math.max(longestStreak, currentStreak)
  
  return { currentStreak, longestStreak, lastLogDate }
}

export const streakRouter = t.router({
  // Get current streak for user
  getStreak: t.procedure
    .query(async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view streak',
          })
        }

        // Try to get existing streak record
        const existingStreak = await db
          .select()
          .from(userStreaks)
          .where(eq(userStreaks.userId, user.id))
          .limit(1)

        // If no record exists, create one
        if (existingStreak.length === 0) {
          const streakData = await calculateStreak(user.id)
          
          const [newStreak] = await db
            .insert(userStreaks)
            .values({
              userId: user.id,
              currentStreak: streakData.currentStreak,
              longestStreak: streakData.longestStreak,
              lastLogDate: streakData.lastLogDate,
            })
            .returning()

          return newStreak
        }

        return existingStreak[0]
      } catch (error) {
        console.error('Error fetching streak:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch streak',
        })
      }
    }),

  // Update/recalculate streak (called after adding food logs)
  updateStreak: t.procedure
    .mutation(async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to update streak',
          })
        }

        // Calculate current streak
        const streakData = await calculateStreak(user.id)

        // Try to get existing streak record
        const existingStreak = await db
          .select()
          .from(userStreaks)
          .where(eq(userStreaks.userId, user.id))
          .limit(1)

        if (existingStreak.length === 0) {
          // Create new record
          const [newStreak] = await db
            .insert(userStreaks)
            .values({
              userId: user.id,
              currentStreak: streakData.currentStreak,
              longestStreak: streakData.longestStreak,
              lastLogDate: streakData.lastLogDate,
            })
            .returning()

          return newStreak
        } else {
          // Update existing record
          const [updatedStreak] = await db
            .update(userStreaks)
            .set({
              currentStreak: streakData.currentStreak,
              longestStreak: streakData.longestStreak,
              lastLogDate: streakData.lastLogDate,
              updatedAt: new Date(),
            })
            .where(eq(userStreaks.userId, user.id))
            .returning()

          return updatedStreak
        }
      } catch (error) {
        console.error('Error updating streak:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update streak',
        })
      }
    }),
})

