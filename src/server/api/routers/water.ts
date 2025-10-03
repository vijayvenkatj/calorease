import { z } from 'zod'
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, waterIntakeLogs, insertWaterIntakeLogSchema } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'

const t = initTRPC.create()

export const waterRouter = t.router({
  // Get water intake logs for a specific date
  getLogsForDate: t.procedure
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
            message: 'Must be logged in to view water intake logs',
          })
        }

        const targetDate = input.date || new Date().toISOString().split('T')[0]

        const logs = await db
          .select()
          .from(waterIntakeLogs)
          .where(and(
            eq(waterIntakeLogs.userId, user.id),
            eq(waterIntakeLogs.date, targetDate)
          ))
          .orderBy(desc(waterIntakeLogs.loggedAt))

        return logs
      } catch (error) {
        console.error('Error fetching water intake logs:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch water intake logs',
        })
      }
    }),

  // Get total water intake for a specific date
  getTotalForDate: t.procedure
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
            message: 'Must be logged in to view water intake',
          })
        }

        const targetDate = input.date || new Date().toISOString().split('T')[0]

        const result = await db
          .select({
            totalMl: sql<number>`COALESCE(SUM(${waterIntakeLogs.amountMl}), 0)::integer`,
          })
          .from(waterIntakeLogs)
          .where(and(
            eq(waterIntakeLogs.userId, user.id),
            eq(waterIntakeLogs.date, targetDate)
          ))

        return {
          date: targetDate,
          totalMl: result[0]?.totalMl || 0,
        }
      } catch (error) {
        console.error('Error fetching total water intake:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch total water intake',
        })
      }
    }),

  // Add a water intake log
  addLog: t.procedure
    .input(insertWaterIntakeLogSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to add water intake logs',
          })
        }

        const currentDate = new Date().toISOString().split('T')[0]

        const [newLog] = await db
          .insert(waterIntakeLogs)
          .values({
            userId: user.id,
            amountMl: input.amountMl,
            date: currentDate,
          })
          .returning()

        return newLog
      } catch (error) {
        console.error('Error adding water intake log:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add water intake log',
        })
      }
    }),

  // Delete a water intake log
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
            message: 'Must be logged in to delete water intake logs',
          })
        }

        // Verify the log belongs to the current user and delete it
        const [deletedLog] = await db
          .delete(waterIntakeLogs)
          .where(and(
            eq(waterIntakeLogs.id, input.id),
            eq(waterIntakeLogs.userId, user.id)
          ))
          .returning()

        if (!deletedLog) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Water intake log not found',
          })
        }

        return { success: true, deletedLog }
      } catch (error) {
        console.error('Error deleting water intake log:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete water intake log',
        })
      }
    }),
})

