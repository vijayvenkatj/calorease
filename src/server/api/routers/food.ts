import { z } from 'zod'
import { and, desc, eq, gte, lt } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, foodLogs, insertFoodLogSchema } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'

const t = initTRPC.create()

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
