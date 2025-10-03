# Water Intake, Streak, and Weekly Progress Features - Implementation Guide

## Overview
This document describes the implementation of three key features: Water Intake tracking, Streak tracking, and Weekly Progress monitoring.

## Database Schema

### 1. Water Intake Logs (`water_intake_logs`)
Tracks water consumption throughout the day.

**Columns:**
- `id` (uuid): Primary key
- `user_id` (uuid): References auth.users.id
- `amount_ml` (integer): Amount of water in milliliters
- `logged_at` (timestamp): When the water was logged
- `date` (text): ISO date string (YYYY-MM-DD) for easy querying

### 2. User Streaks (`user_streaks`)
Tracks consecutive days of food logging activity.

**Columns:**
- `id` (uuid): Primary key
- `user_id` (uuid): References auth.users.id (unique)
- `current_streak` (integer): Current consecutive days
- `longest_streak` (integer): All-time longest streak
- `last_log_date` (text): ISO date string of last activity
- `updated_at` (timestamp): Last update timestamp

### 3. Weekly Progress (`weekly_progress`)
Aggregates nutrition data for each week.

**Columns:**
- `id` (uuid): Primary key
- `user_id` (uuid): References auth.users.id
- `week_start_date` (text): ISO date string (Monday of the week)
- `days_logged` (integer): Number of days with food logs (0-7)
- `total_calories` (numeric): Sum of calories for the week
- `total_protein` (numeric): Sum of protein for the week
- `total_carbs` (numeric): Sum of carbs for the week
- `total_fats` (numeric): Sum of fats for the week
- `total_water_ml` (integer): Sum of water intake for the week
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

## TRPC API Endpoints

### Water Router (`trpc.water`)

#### `getLogsForDate`
Get water intake logs for a specific date.
- **Input:** `{ date?: string }` (optional ISO date, defaults to today)
- **Returns:** Array of water intake logs

#### `getTotalForDate`
Get total water intake for a specific date.
- **Input:** `{ date?: string }` (optional ISO date, defaults to today)
- **Returns:** `{ date: string, totalMl: number }`

#### `addLog`
Add a new water intake log.
- **Input:** `{ amountMl: number }`
- **Returns:** Created water intake log

#### `deleteLog`
Delete a water intake log.
- **Input:** `{ id: string }`
- **Returns:** `{ success: boolean, deletedLog: WaterIntakeLog }`

### Streak Router (`trpc.streak`)

#### `getStreak`
Get current streak information for the logged-in user.
- **Input:** None
- **Returns:** User streak object with current and longest streaks

#### `updateStreak`
Recalculate and update streak (called automatically after food logs).
- **Input:** None
- **Returns:** Updated streak object

### Progress Router (`trpc.progress`)

#### `getWeeklyProgress`
Get weekly progress for current or specific week.
- **Input:** `{ weekStartDate?: string }` (optional, defaults to current week)
- **Returns:** Weekly progress object

#### `updateWeeklyProgress`
Recalculate and update weekly progress (called automatically after food logs).
- **Input:** `{ weekStartDate?: string }` (optional)
- **Returns:** Updated weekly progress object

#### `getProgressHistory`
Get progress history for multiple weeks.
- **Input:** `{ weeks: number }` (1-52, defaults to 4)
- **Returns:** Array of weekly progress objects

## Automatic Updates

The food logging system automatically updates streak and weekly progress when:
1. **Adding a food log** - Updates both streak and weekly progress
2. **Updating a food log** - Updates weekly progress
3. **Deleting a food log** - Updates both streak and weekly progress

This ensures data consistency without requiring manual triggers.

## Components

### `WaterIntakeCard`
Client-side component with interactive water logging.
- **Props:** `currentMl: number`, `goalMl: number`, `className?: string`
- **Features:**
  - Visual progress bar
  - Quick-add buttons (250ml, 500ml)
  - Real-time updates via TRPC mutations
  - Toast notifications for success/error

### `DashboardStats`
Client-side component displaying all three features.
- Fetches data using TRPC queries
- Shows:
  - Water intake with interactive card
  - Weekly progress (days logged this week)
  - Current streak (consecutive days)
  - Average daily calories

## Usage Example

### Client-side (React Component)
```typescript
'use client'
import { trpc } from '@/utils/trpc'

function MyComponent() {
  // Get water intake for today
  const { data: waterData } = trpc.water.getTotalForDate.useQuery({})
  
  // Add water
  const addWater = trpc.water.addLog.useMutation()
  
  // Get streak
  const { data: streak } = trpc.streak.getStreak.useQuery()
  
  // Get weekly progress
  const { data: progress } = trpc.progress.getWeeklyProgress.useQuery({})
  
  return (
    <div>
      <p>Water today: {waterData?.totalMl}ml</p>
      <p>Current streak: {streak?.currentStreak} days</p>
      <p>Days logged this week: {progress?.daysLogged}/7</p>
      <button onClick={() => addWater.mutate({ amountMl: 250 })}>
        Add 250ml
      </button>
    </div>
  )
}
```

## Migration

The database migration has been generated and applied:
- File: `drizzle/0000_far_obadiah_stane.sql`
- Applied using: `npx drizzle-kit push`

## Next Steps

To further enhance these features, consider:
1. Adding user-configurable water intake goals (currently hardcoded to 2500ml)
2. Implementing water intake reminders/notifications
3. Adding charts/graphs for weekly progress visualization
4. Creating a detailed streak history view
5. Adding achievements/badges for milestones
6. Implementing data export functionality

