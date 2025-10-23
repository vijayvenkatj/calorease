import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { initTRPC, TRPCError } from '@trpc/server'
import { db, dishRatings } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'

const t = initTRPC.create()

export const recommendationsRouter = t.router({
  // Get initial dish recommendations based on user's region
  getInitialRecommendations: t.procedure
    .query(async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to get recommendations',
          })
        }

        // Check if user has any existing ratings
        const existingRatings = await db.query.dishRatings.findMany({
          where: (ratings, { eq }) => eq(ratings.userId, user.id),
          limit: 1,
        })

        // If user has ratings, don't fetch initial recommendations
        if (existingRatings.length > 0) {
          return {
            region: null,
            dishes: [],
            message: 'User already has ratings, skipping initial recommendations',
          }
        }

        // Get user's profile to fetch region
        const profile = await db.query.profiles.findFirst({
          where: (profiles, { eq }) => eq(profiles.id, user.id),
        })

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          })
        }

        if (!profile.region) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User region not set. Please update your profile with your region.',
          })
        }

        // Make request to external API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/initial-recommendations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            region: profile.region,
          }),
        })

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch recommendations from external service',
          })
        }

        const data = await response.json()
        
        if (!data.dishes || !Array.isArray(data.dishes)) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Invalid response format from recommendations service',
          })
        }

        return {
          region: data.region,
          dishes: data.dishes,
        }
      } catch (error) {
        console.error('Error fetching initial recommendations:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recommendations',
        })
      }
    }),

  // Rate a dish
  rateDish: t.procedure
    .input(z.object({
      dishName: z.string().min(1, 'Dish name is required').max(200),
      rating: z.number().min(0, 'Rating must be at least 0').max(5, 'Rating must be at most 5'),
    }))
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to rate dishes',
          })
        }

        // Check if rating already exists
        const existingRating = await db.query.dishRatings.findFirst({
          where: (ratings, { and, eq }) => and(
            eq(ratings.userId, user.id),
            eq(ratings.dishName, input.dishName)
          ),
        })

        if (existingRating) {
          // Update existing rating
          const [updatedRating] = await db
            .update(dishRatings)
            .set({
              rating: String(input.rating),
              updatedAt: new Date(),
            })
            .where(eq(dishRatings.id, existingRating.id))
            .returning()

          return updatedRating
        } else {
          // Create new rating
          const [newRating] = await db
            .insert(dishRatings)
            .values({
              userId: user.id,
              dishName: input.dishName,
              rating: String(input.rating),
            })
            .returning()

          return newRating
        }
      } catch (error) {
        console.error('Error rating dish:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save rating',
        })
      }
    }),

  // Get user's ratings
  getMyRatings: t.procedure
    .query(async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to view ratings',
          })
        }

        const ratings = await db.query.dishRatings.findMany({
          where: (ratings, { eq }) => eq(ratings.userId, user.id),
          orderBy: (ratings, { desc }) => desc(ratings.updatedAt),
        })

        return ratings
      } catch (error) {
        console.error('Error fetching user ratings:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch ratings',
        })
      }
    }),

  // Add a custom meal to the external recommendation system
  addCustomMeal: t.procedure
    .input(z.object({
      name: z.string().min(1, 'Meal name is required').max(200),
      ingredients: z.string().min(1, 'Ingredients are required').max(1000),
      diet: z.enum(['veg', 'non-veg']),
    }))
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to add custom meals',
          })
        }

        // Send request to external API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: input.name,
            ingredients: input.ingredients,
            diet: input.diet,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('External API error:', response.status, errorText)
          
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to add meal to recommendation system: ${response.status}`,
          })
        }

        const data = await response.json()
        
        return {
          success: true,
          mealName: input.name,
          data: data,
        }
      } catch (error) {
        console.error('Error adding custom meal:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add custom meal',
        })
      }
    }),

  // Get personalized meal recommendations based on user's ratings
  getPersonalizedRecommendations: t.procedure
    .query(async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Must be logged in to get recommendations',
          })
        }

        // Get all user ratings
        const ratings = await db.query.dishRatings.findMany({
          where: (ratings, { eq }) => eq(ratings.userId, user.id),
          orderBy: (ratings, { desc }) => desc(ratings.updatedAt),
        })

        // If user has no ratings, return empty array
        if (ratings.length === 0) {
          return {
            recommendations: [],
            message: 'No ratings found. Rate some dishes to get personalized recommendations.',
          }
        }

        // Format ratings for the API
        const meals = ratings.map(rating => ({
          name: rating.dishName,
          rating: Number(rating.rating),
        }))

        console.log(JSON.stringify({meals, top_k: 5}))

        // Make request to external API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meals,
            top_k: 5,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('External API error:', response.status, errorText)
          
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch personalized recommendations: ${response.status}`,
          })
        }

        const data = await response.json()
        
        if (!data.recommendations || !Array.isArray(data.recommendations)) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Invalid response format from recommendations service',
          })
        }

        return {
          recommendations: data.recommendations,
          userRatingsCount: ratings.length,
        }
      } catch (error) {
        console.error('Error fetching personalized recommendations:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch personalized recommendations',
        })
      }
    }),
})
