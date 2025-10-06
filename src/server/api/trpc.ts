import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, profiles, insertProfileSchema } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { foodRouter } from "./routers/food";
import { waterRouter } from "./routers/water";
import { streakRouter } from "./routers/streak";
import { progressRouter } from "./routers/progress";
import { analyticsRouter } from "./routers/analytics";
import { notificationsRouter } from "./routers/notifications";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input?.name ?? "world"}!` };
    }),

  // Onboarding mutations
  onboarding: t.router({
    // Create profile after successful signup
    createProfile: t.procedure
      .input(insertProfileSchema.extend({
        userId: z.string().uuid(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { userId, ...profileData } = input;
          
          const [newProfile] = await db
            .insert(profiles)
            .values({
              id: userId,
              ...profileData,
              weight: String(profileData.weight),
              height: String(profileData.height),
              waist: profileData.waist ? String(profileData.waist) : undefined,
              hips: profileData.hips ? String(profileData.hips) : undefined,
              chest: profileData.chest ? String(profileData.chest) : undefined,
              arms: profileData.arms ? String(profileData.arms) : undefined,
            })
            .returning();

          return newProfile;
        } catch (error) {
          console.error('Error creating profile:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create profile',
          });
        }
      }),

    // Get profile by user ID
    getProfile: t.procedure
      .input(z.object({ userId: z.string().uuid() }))
      .query(async ({ input }) => {
        try {
          const profile = await db.query.profiles.findFirst({
            where: (profiles, { eq }) => eq(profiles.id, input.userId),
          });

          return profile;
        } catch (error) {
          console.error('Error fetching profile:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch profile',
          });
        }
      }),

    // Get current user's profile
    getMyProfile: t.procedure
      .query(async () => {
        try {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Must be logged in',
            });
          }

          const profile = await db.query.profiles.findFirst({
            where: (profiles, { eq }) => eq(profiles.id, user.id),
          });

          return profile;
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch profile',
          });
        }
      }),

    // Update profile
    updateProfile: t.procedure
      .input(insertProfileSchema.extend({
        userId: z.string().uuid(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { userId, ...profileData } = input;
          
          const [updatedProfile] = await db
            .update(profiles)
            .set({
              ...profileData,
              weight: String(profileData.weight),
              height: String(profileData.height),
              waist: profileData.waist ? String(profileData.waist) : undefined,
              hips: profileData.hips ? String(profileData.hips) : undefined,
              chest: profileData.chest ? String(profileData.chest) : undefined,
              arms: profileData.arms ? String(profileData.arms) : undefined,
              updatedAt: new Date(),
            })
            .where(eq(profiles.id, userId))
            .returning();

          return updatedProfile;
        } catch (error) {
          console.error('Error updating profile:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update profile',
          });
        }
      }),

    // Update current user's profile
    updateMyProfile: t.procedure
      .input(insertProfileSchema)
      .mutation(async ({ input }) => {
        try {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Must be logged in',
            });
          }

          const [updatedProfile] = await db
            .update(profiles)
            .set({
              ...input,
              weight: String(input.weight),
              height: String(input.height),
              waist: input.waist ? String(input.waist) : undefined,
              hips: input.hips ? String(input.hips) : undefined,
              chest: input.chest ? String(input.chest) : undefined,
              arms: input.arms ? String(input.arms) : undefined,    
              updatedAt: new Date(),
            })
            .where(eq(profiles.id, user.id))
            .returning();

          if (!updatedProfile) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Profile not found',
            });
          }

          return updatedProfile;
        } catch (error) {
          console.error('Error updating profile:', error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update profile',
          });
        }
      }),

    // Complete signup with onboarding data
    completeSignupWithOnboarding: t.procedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        onboardingData: insertProfileSchema,
      }))
      .mutation(async ({ input }) => {
        try {
          const { email, password, onboardingData } = input;
          
          // Create Supabase client
          const supabase = await createClient();
          
          // Sign up user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: onboardingData.name,
              },
              emailRedirectTo: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/auth/callback`,
            },
          });

          if (authError) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: authError.message,
            });
          }

          if (!authData.user) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create user',
            });
          }

          // Create profile with onboarding data
          const [newProfile] = await db
            .insert(profiles)
            .values({
              id: authData.user.id,
              ...onboardingData,
              weight: String(onboardingData.weight),
              height: String(onboardingData.height),
              waist: onboardingData.waist ? String(onboardingData.waist) : undefined,
              hips: onboardingData.hips ? String(onboardingData.hips) : undefined,
              chest: onboardingData.chest ? String(onboardingData.chest) : undefined,
              arms: onboardingData.arms ? String(onboardingData.arms) : undefined,
            })
            .returning();

          return {
            user: authData.user,
            profile: newProfile,
          };
        } catch (error) {
          console.error('Error completing signup with onboarding:', error);
          
          if (error instanceof TRPCError) {
            throw error;
          }
          
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to complete signup',
          });
        }
      }),
  }),

  // Food logging router
  food: foodRouter,

  // Water intake router
  water: waterRouter,

  // Streak tracking router
  streak: streakRouter,

  // Weekly progress router
  progress: progressRouter,

  // Analytics router (weight tracking and calculations)
  analytics: analyticsRouter,

  // Notifications router
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
