import { z } from 'zod'
import { and, desc, eq, gte, lt, sql, or, ilike } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, foodLogs, insertFoodLogSchema, userStreaks, weeklyProgress, inAppNotifications, foodItems, insertFoodItemSchema } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'
import { getResendClient } from '@/utils/resend'

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
      const checkDate = new Date(lastLog)
    
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

        // Create in-app notification
        await db.insert(inAppNotifications).values({
          userId: user.id,
          type: 'food_logged',
          title: 'Food logged successfully!',
          message: `You logged ${input.foodName} (${input.calories} cal)`,
        })

        // Send email notification if enabled
        const settings = await db.query.notificationSettings.findFirst({
          where: (ns, { eq }) => eq(ns.userId, user.id),
        })

        if (settings && settings.emailEnabled === 1) {
          const profile = await db.query.profiles.findFirst({
            where: (p, { eq }) => eq(p.id, user.id),
          })

          try {
            const resend = getResendClient()
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
              (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

            await resend.emails.send({
              from: process.env.RESEND_FROM || 'CalorEase <noreply@calorease.dev>',
              to: user.email!,
              subject: 'Food logged - Great job!',
              html: `
                <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6">
                  <h2>Hello ${profile?.name ?? 'there'} 👋</h2>
                  <p>You just logged: <strong>${input.foodName}</strong> (${input.calories} calories)</p>
                  <p>Keep up the great work tracking your nutrition!</p>
                  <p><a href="${appUrl}/dashboard" style="display:inline-block;padding:10px 16px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none">View Dashboard</a></p>
                </div>
              `,
            })
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError)
            // Don't throw - email failure shouldn't fail the whole operation
          }
        }

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

  // Search food items
  searchFoodItems: t.procedure
    .input(z.object({
      query: z.string().min(1).max(100),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to search food items',
          })
        }

        // Search in both CSV items and user's custom items
        const searchPattern = `%${input.query}%`
        
        const results = await db
          .select()
          .from(foodItems)
          .where(
            and(
              ilike(foodItems.dishName, searchPattern),
              or(
                eq(foodItems.isCustom, 0), // CSV items
                eq(foodItems.createdBy, user.id) // User's custom items
              )
            )
          )
          .limit(input.limit)
          .orderBy(foodItems.dishName)

        return results
      } catch (error) {
        console.error('Error searching food items:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search food items',
        })
      }
    }),

  // Get a single food item by ID
  getFoodItem: t.procedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view food items',
          })
        }

        const [item] = await db
          .select()
          .from(foodItems)
          .where(eq(foodItems.id, input.id))
          .limit(1)

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Food item not found',
          })
        }

        // Check if it's a custom item that belongs to another user
        if (item.isCustom === 1 && item.createdBy !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot access this food item',
          })
        }

        return item
      } catch (error) {
        console.error('Error fetching food item:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch food item',
        })
      }
    }),

  // Create a custom food item
  createFoodItem: t.procedure
    .input(insertFoodItemSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to create food items',
          })
        }

        const [newItem] = await db
          .insert(foodItems)
          .values({
            dishName: input.dishName,
            calories: String(input.calories),
            carbohydrates: String(input.carbohydrates),
            protein: String(input.protein),
            fats: String(input.fats),
            freeSugar: input.freeSugar ? String(input.freeSugar) : '0',
            fibre: input.fibre ? String(input.fibre) : '0',
            sodium: input.sodium ? String(input.sodium) : '0',
            calcium: input.calcium ? String(input.calcium) : '0',
            iron: input.iron ? String(input.iron) : '0',
            vitaminC: input.vitaminC ? String(input.vitaminC) : '0',
            folate: input.folate ? String(input.folate) : '0',
            isCustom: 1,
            createdBy: user.id,
          })
          .returning()

        return newItem
      } catch (error) {
        console.error('Error creating food item:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create food item',
        })
      }
    }),

  // Get user's custom food items
  getMyCustomFoodItems: t.procedure
    .query(async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view custom food items',
          })
        }

        const items = await db
          .select()
          .from(foodItems)
          .where(
            and(
              eq(foodItems.isCustom, 1),
              eq(foodItems.createdBy, user.id)
            )
          )
          .orderBy(desc(foodItems.createdAt))

        return items
      } catch (error) {
        console.error('Error fetching custom food items:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch custom food items',
        })
      }
    }),

  // Add multiple food logs in a batch (for image recognition)
  addBatchLogs: t.procedure
    .input(z.object({
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      foodItems: z.array(z.object({
        foodName: z.string().min(1, 'Food name is required').max(100),
        calories: z.number().min(0, 'Calories must be 0 or greater').max(10000, 'Calories must be realistic'),
        protein: z.number().min(0, 'Protein must be 0 or greater').max(1000, 'Protein must be realistic').optional(),
        carbs: z.number().min(0, 'Carbs must be 0 or greater').max(1000, 'Carbs must be realistic').optional(),
        fats: z.number().min(0, 'Fats must be 0 or greater').max(1000, 'Fats must be realistic').optional(),
      })).min(1, 'At least one food item is required').max(20, 'Too many food items'),
    }))
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

        // Insert all food logs in a transaction
        const newLogs = await db.transaction(async (tx) => {
          const logs = []
          
          for (const item of input.foodItems) {
            const [newLog] = await tx
              .insert(foodLogs)
              .values({
                userId: user.id,
                mealType: input.mealType,
                foodName: item.foodName,
                calories: String(item.calories),
                protein: item.protein ? String(item.protein) : '0',
                carbs: item.carbs ? String(item.carbs) : '0',
                fats: item.fats ? String(item.fats) : '0',
              })
              .returning()
            
            logs.push(newLog)
          }
          
          return logs
        })

        // Update streak and weekly progress asynchronously
        const weekStartDate = getMondayOfWeek(new Date())
        await Promise.all([
          updateUserStreak(user.id),
          updateWeeklyProgressForUser(user.id, weekStartDate),
        ])

        // Create in-app notification
        await db.insert(inAppNotifications).values({
          userId: user.id,
          type: 'food_logged',
          title: 'Food logged successfully!',
          message: `${input.foodItems.length} items logged for ${input.mealType}`,
        })

        // Send email notification if enabled
        const settings = await db.query.notificationSettings.findFirst({
          where: (ns, { eq }) => eq(ns.userId, user.id),
        })

        if (settings && settings.emailEnabled === 1) {
          const profile = await db.query.profiles.findFirst({
            where: (p, { eq }) => eq(p.id, user.id),
          })

          try {
            const resend = getResendClient()
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
              (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

            const totalCalories = input.foodItems.reduce((sum, item) => sum + item.calories, 0)
            const foodNames = input.foodItems.map(item => item.foodName).join(', ')

            await resend.emails.send({
              from: process.env.RESEND_FROM || 'CalorEase <noreply@calorease.dev>',
              to: user.email!,
              subject: 'Food logged - Great job!',
              html: `
                <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6">
                  <h2>Hello ${profile?.name ?? 'there'} 👋</h2>
                  <p>You just logged ${input.foodItems.length} items for ${input.mealType}: <strong>${foodNames}</strong></p>
                  <p>Total calories: <strong>${totalCalories}</strong></p>
                  <p>Keep up the great work tracking your nutrition!</p>
                  <p><a href="${appUrl}/dashboard" style="display:inline-block;padding:10px 16px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none">View Dashboard</a></p>
                </div>
              `,
            })
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError)
            // Don't throw - email failure shouldn't fail the whole operation
          }
        }

        return {
          success: true,
          logs: newLogs,
          count: newLogs.length,
        }
      } catch (error) {
        console.error('Error adding batch food logs:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add food logs',
        })
      }
    }),
})
