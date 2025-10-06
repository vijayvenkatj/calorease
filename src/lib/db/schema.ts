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

export const foodLogs = pgTable('food_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users.id
  mealType: text('meal_type').notNull(),
  foodName: text('food_name').notNull(),
  calories: numeric('calories', { precision: 8, scale: 2 }).notNull(),
  protein: numeric('protein', { precision: 8, scale: 2 }).default('0'),
  carbs: numeric('carbs', { precision: 8, scale: 2 }).default('0'),
  fats: numeric('fats', { precision: 8, scale: 2 }).default('0'),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
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
  waist: z.union([
    z.string().transform(Number).pipe(z.number().min(40).max(200)),
    z.literal('').transform(() => undefined),
    z.undefined()
  ]).optional(),
  hips: z.union([
    z.string().transform(Number).pipe(z.number().min(40).max(200)),
    z.literal('').transform(() => undefined),
    z.undefined()
  ]).optional(),
  chest: z.union([
    z.string().transform(Number).pipe(z.number().min(40).max(200)),
    z.literal('').transform(() => undefined),
    z.undefined()
  ]).optional(),
  arms: z.union([
    z.string().transform(Number).pipe(z.number().min(15).max(100)),
    z.literal('').transform(() => undefined),
    z.undefined()
  ]).optional(),
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

// Food logs schemas
export const insertFoodLogSchema = createInsertSchema(foodLogs, {
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foodName: z.string().min(1, 'Food name is required').max(100),
  calories: z.string().transform(Number).pipe(
    z.number().min(0, 'Calories must be 0 or greater').max(10000, 'Calories must be realistic')
  ),
  protein: z.string().transform(Number).pipe(
    z.number().min(0, 'Protein must be 0 or greater').max(1000, 'Protein must be realistic')
  ).optional(),
  carbs: z.string().transform(Number).pipe(
    z.number().min(0, 'Carbs must be 0 or greater').max(1000, 'Carbs must be realistic')
  ).optional(),
  fats: z.string().transform(Number).pipe(
    z.number().min(0, 'Fats must be 0 or greater').max(1000, 'Fats must be realistic')
  ).optional(),
}).omit({
  id: true,
  userId: true,
  loggedAt: true,
})

// Form input schema (for React Hook Form)
export const foodLogFormSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foodName: z.string().min(1, 'Food name is required').max(100),
  calories: z.string().min(1, 'Calories is required'),
  protein: z.string().optional(),
  carbs: z.string().optional(),
  fats: z.string().optional(),
})

export const selectFoodLogSchema = createSelectSchema(foodLogs)

// Type exports for food logs
export type FoodLog = Omit<typeof foodLogs.$inferSelect, 'loggedAt'> & {
  loggedAt: string // Database returns string
}
export type NewFoodLog = typeof foodLogs.$inferInsert
export type FoodLogInput = z.infer<typeof insertFoodLogSchema>
export type FoodLogFormInput = z.infer<typeof foodLogFormSchema>

// Meal type enum
export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const
export type MealType = typeof mealTypes[number]

// Water intake logs
export const waterIntakeLogs = pgTable('water_intake_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users.id
  amountMl: integer('amount_ml').notNull(), // Amount in milliliters
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD) for easy querying
})

// User streaks tracking
export const userStreaks = pgTable('user_streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // References auth.users.id
  currentStreak: integer('current_streak').notNull().default(0), // Current consecutive days
  longestStreak: integer('longest_streak').notNull().default(0), // All-time longest streak
  lastLogDate: text('last_log_date'), // ISO date string (YYYY-MM-DD) of last activity
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Weekly progress tracking
export const weeklyProgress = pgTable('weekly_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users.id
  weekStartDate: text('week_start_date').notNull(), // ISO date string (YYYY-MM-DD) - Monday of the week
  daysLogged: integer('days_logged').notNull().default(0), // Number of days with food logs (0-7)
  totalCalories: numeric('total_calories', { precision: 10, scale: 2 }).notNull().default('0'),
  totalProtein: numeric('total_protein', { precision: 8, scale: 2 }).notNull().default('0'),
  totalCarbs: numeric('total_carbs', { precision: 8, scale: 2 }).notNull().default('0'),
  totalFats: numeric('total_fats', { precision: 8, scale: 2 }).notNull().default('0'),
  totalWaterMl: integer('total_water_ml').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Water intake schemas
export const insertWaterIntakeLogSchema = createInsertSchema(waterIntakeLogs, {
  amountMl: z.number().min(1, 'Amount must be at least 1ml').max(5000, 'Amount must be realistic'),
}).omit({
  id: true,
  userId: true,
  loggedAt: true,
  date: true,
})

export const selectWaterIntakeLogSchema = createSelectSchema(waterIntakeLogs)

// Type exports for water intake
export type WaterIntakeLog = typeof waterIntakeLogs.$inferSelect
export type NewWaterIntakeLog = typeof waterIntakeLogs.$inferInsert
export type WaterIntakeLogInput = z.infer<typeof insertWaterIntakeLogSchema>

// User streaks schemas
export const selectUserStreakSchema = createSelectSchema(userStreaks)

// Type exports for streaks
export type UserStreak = typeof userStreaks.$inferSelect
export type NewUserStreak = typeof userStreaks.$inferInsert

// Weekly progress schemas
export const selectWeeklyProgressSchema = createSelectSchema(weeklyProgress)

// Type exports for weekly progress
export type WeeklyProgress = typeof weeklyProgress.$inferSelect
export type NewWeeklyProgress = typeof weeklyProgress.$inferInsert

// Weight tracking logs
export const weightLogs = pgTable('weight_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users.id
  weight: numeric('weight', { precision: 5, scale: 2 }).notNull(), // Weight in kg
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  notes: text('notes'), // Optional notes
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
})

// Weight logs schemas
export const insertWeightLogSchema = createInsertSchema(weightLogs, {
  weight: z.string().transform(Number).pipe(
    z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight must be realistic')
  ),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).omit({
  id: true,
  userId: true,
  loggedAt: true,
  date: true,
})

export const selectWeightLogSchema = createSelectSchema(weightLogs)

// Notification settings
export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  emailEnabled: integer('email_enabled').default(1).notNull(), // 1=true, 0=false
  frequency: text('frequency').default('daily').notNull(), // daily | weekly
  lastSentAt: timestamp('last_sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const selectNotificationSettingsSchema = createSelectSchema(notificationSettings)
export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({ id: true, createdAt: true, updatedAt: true })

// In-app notifications
export const inAppNotifications = pgTable('in_app_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(), // 'food_logged' | 'water_logged' | 'streak' | 'goal'
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read').default(0).notNull(), // 0=unread, 1=read
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const selectInAppNotificationSchema = createSelectSchema(inAppNotifications)

// Type exports for weight logs
export type WeightLog = typeof weightLogs.$inferSelect
export type NewWeightLog = typeof weightLogs.$inferInsert
export type WeightLogInput = z.infer<typeof insertWeightLogSchema>

// Type exports for in-app notifications
export type InAppNotification = typeof inAppNotifications.$inferSelect
export type NewInAppNotification = typeof inAppNotifications.$inferInsert
