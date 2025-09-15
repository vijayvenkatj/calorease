import { pgTable, text, integer, numeric, uuid, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // This will reference auth.users.id
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  weight: numeric('weight', { precision: 5, scale: 2 }).notNull(), // kg
  height: numeric('height', { precision: 5, scale: 2 }).notNull(), // cm
  goals: text('goals').notNull(),
  activityLevel: text('activity_level').notNull(),
  
  // Measurements (optional)
  waist: numeric('waist', { precision: 5, scale: 2 }),
  hips: numeric('hips', { precision: 5, scale: 2 }),
  chest: numeric('chest', { precision: 5, scale: 2 }),
  arms: numeric('arms', { precision: 5, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles, {
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Age must be realistic'),
  gender: z.enum(['male', 'female', 'other']),
  weight: z.string().transform(Number).pipe(
    z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight must be realistic')
  ),
  height: z.string().transform(Number).pipe(
    z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be realistic')
  ),
  goals: z.enum(['lose_weight', 'gain_muscle', 'maintain_weight', 'improve_health', 'increase_strength']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  waist: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(
    z.number().min(40).max(200).optional()
  ),
  hips: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(
    z.number().min(40).max(200).optional()
  ),
  chest: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(
    z.number().min(40).max(200).optional()
  ),
  arms: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(
    z.number().min(15).max(100).optional()
  ),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const selectProfileSchema = createSelectSchema(profiles)

// Type exports
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type OnboardingData = z.infer<typeof insertProfileSchema>

// Onboarding step schemas
export const personalDataSchema = z.object({
  name: insertProfileSchema.shape.name,
  age: insertProfileSchema.shape.age,
  gender: insertProfileSchema.shape.gender,
  weight: insertProfileSchema.shape.weight,
  height: insertProfileSchema.shape.height,
})

export const goalsSchema = z.object({
  goals: insertProfileSchema.shape.goals,
})

export const activityLevelSchema = z.object({
  activityLevel: insertProfileSchema.shape.activityLevel,
})

export const measurementsSchema = z.object({
  waist: z.string().optional(),
  hips: z.string().optional(),
  chest: z.string().optional(),
  arms: z.string().optional(),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Step type definitions
export type PersonalData = z.infer<typeof personalDataSchema>
export type Goals = z.infer<typeof goalsSchema>
export type ActivityLevel = z.infer<typeof activityLevelSchema>
export type Measurements = z.infer<typeof measurementsSchema>
export type SignupData = z.infer<typeof signupSchema>

// Complete onboarding data combining all steps
export type CompleteOnboardingData = PersonalData & Goals & ActivityLevel & Measurements & Omit<SignupData, 'confirmPassword'>
