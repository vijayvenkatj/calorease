"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectWeightLogSchema = exports.insertWeightLogSchema = exports.weightLogs = exports.selectWeeklyProgressSchema = exports.selectUserStreakSchema = exports.selectWaterIntakeLogSchema = exports.insertWaterIntakeLogSchema = exports.weeklyProgress = exports.userStreaks = exports.waterIntakeLogs = exports.mealTypes = exports.selectFoodLogSchema = exports.foodLogFormSchema = exports.insertFoodLogSchema = exports.signupSchema = exports.measurementsSchema = exports.activityLevelSchema = exports.goalsSchema = exports.personalDataSchema = exports.selectProfileSchema = exports.insertProfileSchema = exports.foodLogs = exports.profiles = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
exports.profiles = (0, pg_core_1.pgTable)('profiles', {
    id: (0, pg_core_1.uuid)('id').primaryKey(), // This will reference auth.users.id
    name: (0, pg_core_1.text)('name').notNull(),
    age: (0, pg_core_1.integer)('age').notNull(),
    gender: (0, pg_core_1.text)('gender').notNull(),
    weight: (0, pg_core_1.numeric)('weight', { precision: 5, scale: 2 }).notNull(), // kg
    height: (0, pg_core_1.numeric)('height', { precision: 5, scale: 2 }).notNull(), // cm
    goals: (0, pg_core_1.text)('goals').notNull(),
    activityLevel: (0, pg_core_1.text)('activity_level').notNull(),
    // Measurements (optional)
    waist: (0, pg_core_1.numeric)('waist', { precision: 5, scale: 2 }),
    hips: (0, pg_core_1.numeric)('hips', { precision: 5, scale: 2 }),
    chest: (0, pg_core_1.numeric)('chest', { precision: 5, scale: 2 }),
    arms: (0, pg_core_1.numeric)('arms', { precision: 5, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.foodLogs = (0, pg_core_1.pgTable)('food_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(), // References auth.users.id
    mealType: (0, pg_core_1.text)('meal_type').notNull(),
    foodName: (0, pg_core_1.text)('food_name').notNull(),
    calories: (0, pg_core_1.numeric)('calories', { precision: 8, scale: 2 }).notNull(),
    protein: (0, pg_core_1.numeric)('protein', { precision: 8, scale: 2 }).default('0'),
    carbs: (0, pg_core_1.numeric)('carbs', { precision: 8, scale: 2 }).default('0'),
    fats: (0, pg_core_1.numeric)('fats', { precision: 8, scale: 2 }).default('0'),
    loggedAt: (0, pg_core_1.timestamp)('logged_at').defaultNow().notNull(),
});
// Zod schemas for validation
exports.insertProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profiles, {
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    age: zod_1.z.number().min(13, 'Must be at least 13 years old').max(120, 'Age must be realistic'),
    gender: zod_1.z.enum(['male', 'female', 'other']),
    weight: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight must be realistic')),
    height: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be realistic')),
    goals: zod_1.z.enum(['lose_weight', 'gain_muscle', 'maintain_weight', 'improve_health', 'increase_strength']),
    activityLevel: zod_1.z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
    waist: zod_1.z.union([
        zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(40).max(200)),
        zod_1.z.literal('').transform(function () { return undefined; }),
        zod_1.z.undefined()
    ]).optional(),
    hips: zod_1.z.union([
        zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(40).max(200)),
        zod_1.z.literal('').transform(function () { return undefined; }),
        zod_1.z.undefined()
    ]).optional(),
    chest: zod_1.z.union([
        zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(40).max(200)),
        zod_1.z.literal('').transform(function () { return undefined; }),
        zod_1.z.undefined()
    ]).optional(),
    arms: zod_1.z.union([
        zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(15).max(100)),
        zod_1.z.literal('').transform(function () { return undefined; }),
        zod_1.z.undefined()
    ]).optional(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.selectProfileSchema = (0, drizzle_zod_1.createSelectSchema)(exports.profiles);
// Onboarding step schemas
exports.personalDataSchema = zod_1.z.object({
    name: exports.insertProfileSchema.shape.name,
    age: exports.insertProfileSchema.shape.age,
    gender: exports.insertProfileSchema.shape.gender,
    weight: exports.insertProfileSchema.shape.weight,
    height: exports.insertProfileSchema.shape.height,
});
exports.goalsSchema = zod_1.z.object({
    goals: exports.insertProfileSchema.shape.goals,
});
exports.activityLevelSchema = zod_1.z.object({
    activityLevel: exports.insertProfileSchema.shape.activityLevel,
});
exports.measurementsSchema = zod_1.z.object({
    waist: zod_1.z.string().optional(),
    hips: zod_1.z.string().optional(),
    chest: zod_1.z.string().optional(),
    arms: zod_1.z.string().optional(),
});
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: zod_1.z.string(),
}).refine(function (data) { return data.password === data.confirmPassword; }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Food logs schemas
exports.insertFoodLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.foodLogs, {
    mealType: zod_1.z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foodName: zod_1.z.string().min(1, 'Food name is required').max(100),
    calories: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0, 'Calories must be 0 or greater').max(10000, 'Calories must be realistic')),
    protein: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0, 'Protein must be 0 or greater').max(1000, 'Protein must be realistic')).optional(),
    carbs: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0, 'Carbs must be 0 or greater').max(1000, 'Carbs must be realistic')).optional(),
    fats: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0, 'Fats must be 0 or greater').max(1000, 'Fats must be realistic')).optional(),
}).omit({
    id: true,
    userId: true,
    loggedAt: true,
});
// Form input schema (for React Hook Form)
exports.foodLogFormSchema = zod_1.z.object({
    mealType: zod_1.z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foodName: zod_1.z.string().min(1, 'Food name is required').max(100),
    calories: zod_1.z.string().min(1, 'Calories is required'),
    protein: zod_1.z.string().optional(),
    carbs: zod_1.z.string().optional(),
    fats: zod_1.z.string().optional(),
});
exports.selectFoodLogSchema = (0, drizzle_zod_1.createSelectSchema)(exports.foodLogs);
// Meal type enum
exports.mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
// Water intake logs
exports.waterIntakeLogs = (0, pg_core_1.pgTable)('water_intake_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(), // References auth.users.id
    amountMl: (0, pg_core_1.integer)('amount_ml').notNull(), // Amount in milliliters
    loggedAt: (0, pg_core_1.timestamp)('logged_at').defaultNow().notNull(),
    date: (0, pg_core_1.text)('date').notNull(), // ISO date string (YYYY-MM-DD) for easy querying
});
// User streaks tracking
exports.userStreaks = (0, pg_core_1.pgTable)('user_streaks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().unique(), // References auth.users.id
    currentStreak: (0, pg_core_1.integer)('current_streak').notNull().default(0), // Current consecutive days
    longestStreak: (0, pg_core_1.integer)('longest_streak').notNull().default(0), // All-time longest streak
    lastLogDate: (0, pg_core_1.text)('last_log_date'), // ISO date string (YYYY-MM-DD) of last activity
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Weekly progress tracking
exports.weeklyProgress = (0, pg_core_1.pgTable)('weekly_progress', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(), // References auth.users.id
    weekStartDate: (0, pg_core_1.text)('week_start_date').notNull(), // ISO date string (YYYY-MM-DD) - Monday of the week
    daysLogged: (0, pg_core_1.integer)('days_logged').notNull().default(0), // Number of days with food logs (0-7)
    totalCalories: (0, pg_core_1.numeric)('total_calories', { precision: 10, scale: 2 }).notNull().default('0'),
    totalProtein: (0, pg_core_1.numeric)('total_protein', { precision: 8, scale: 2 }).notNull().default('0'),
    totalCarbs: (0, pg_core_1.numeric)('total_carbs', { precision: 8, scale: 2 }).notNull().default('0'),
    totalFats: (0, pg_core_1.numeric)('total_fats', { precision: 8, scale: 2 }).notNull().default('0'),
    totalWaterMl: (0, pg_core_1.integer)('total_water_ml').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Water intake schemas
exports.insertWaterIntakeLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.waterIntakeLogs, {
    amountMl: zod_1.z.number().min(1, 'Amount must be at least 1ml').max(5000, 'Amount must be realistic'),
}).omit({
    id: true,
    userId: true,
    loggedAt: true,
    date: true,
});
exports.selectWaterIntakeLogSchema = (0, drizzle_zod_1.createSelectSchema)(exports.waterIntakeLogs);
// User streaks schemas
exports.selectUserStreakSchema = (0, drizzle_zod_1.createSelectSchema)(exports.userStreaks);
// Weekly progress schemas
exports.selectWeeklyProgressSchema = (0, drizzle_zod_1.createSelectSchema)(exports.weeklyProgress);
// Weight tracking logs
exports.weightLogs = (0, pg_core_1.pgTable)('weight_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(), // References auth.users.id
    weight: (0, pg_core_1.numeric)('weight', { precision: 5, scale: 2 }).notNull(), // Weight in kg
    date: (0, pg_core_1.text)('date').notNull(), // ISO date string (YYYY-MM-DD)
    notes: (0, pg_core_1.text)('notes'), // Optional notes
    loggedAt: (0, pg_core_1.timestamp)('logged_at').defaultNow().notNull(),
});
// Weight logs schemas
exports.insertWeightLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.weightLogs, {
    weight: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight must be realistic')),
    notes: zod_1.z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).omit({
    id: true,
    userId: true,
    loggedAt: true,
    date: true,
});
exports.selectWeightLogSchema = (0, drizzle_zod_1.createSelectSchema)(exports.weightLogs);
