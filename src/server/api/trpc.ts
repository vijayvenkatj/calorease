import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, profiles, insertProfileSchema, type OnboardingData } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";

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
});

export type AppRouter = typeof appRouter;
