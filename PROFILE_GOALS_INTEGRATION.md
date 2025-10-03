# Profile Goals Integration

## Overview

The analytics system now automatically uses the user's goal from their profile to calculate target calories, eliminating the need for manual input of `targetWeeklyWeightChange`.

## Changes Made

### 1. Backend: Analytics Router (`src/server/api/routers/analytics.ts`)

#### Removed Manual Input
**Before:**
```typescript
.input(z.object({
  days: z.number().min(7).max(365).default(7),
  targetWeeklyWeightChange: z.number().min(-2).max(2).default(-0.5), // Manual input ❌
}))
```

**After:**
```typescript
.input(z.object({
  days: z.number().min(7).max(365).default(7),
  // No manual targetWeeklyWeightChange needed! ✅
}))
```

#### Added Profile Lookup
```typescript
// Fetch user profile to get their goal
const userProfile = await db
  .select()
  .from(profiles)
  .where(eq(profiles.id, user.id))
  .limit(1)

if (!userProfile || userProfile.length === 0) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'User profile not found',
  })
}

const profile = userProfile[0]
```

#### Goal-Based Target Weight Change
```typescript
// Determine target weekly weight change based on user's goal
let targetWeeklyWeightChange = 0 // maintain_weight

switch (profile.goals) {
  case 'lose_weight':
    targetWeeklyWeightChange = -0.5 // Lose 0.5 kg per week (sustainable)
    break
  case 'gain_muscle':
  case 'increase_strength':
    targetWeeklyWeightChange = 0.25 // Gain 0.25 kg per week (lean muscle gain)
    break
  case 'maintain_weight':
  case 'improve_health':
  default:
    targetWeeklyWeightChange = 0 // Maintain current weight
    break
}
```

#### Updated Response
```typescript
return {
  // ... existing fields
  targetWeeklyWeightChange, // From user's profile goal ✅
  userGoal: profile.goals, // Include the actual goal name ✅
  // ... other fields
}
```

### 2. Frontend: AnalyticsCharts Component (`src/components/analytics/AnalyticsCharts.tsx`)

#### Removed Manual Prop
**Before:**
```typescript
interface AnalyticsChartsProps {
  days?: number
  targetWeeklyWeightChange?: number // Manual prop ❌
}

export default function AnalyticsCharts({ 
  days = 7, 
  targetWeeklyWeightChange = -0.5 
}: AnalyticsChartsProps) {
  const { data: analytics } = trpc.analytics.getAnalytics.useQuery({
    days,
    targetWeeklyWeightChange, // Manual value ❌
  })
}
```

**After:**
```typescript
interface AnalyticsChartsProps {
  days?: number
  // No targetWeeklyWeightChange prop needed! ✅
}

export default function AnalyticsCharts({ 
  days = 7
}: AnalyticsChartsProps) {
  const { data: analytics } = trpc.analytics.getAnalytics.useQuery({
    days, // Only need days ✅
  })
}
```

#### Added Goal Display Helper
```typescript
// Helper function to get goal display text
function getGoalDisplayText(goal: string): string {
  switch (goal) {
    case 'lose_weight':
      return 'Lose Weight'
    case 'gain_muscle':
      return 'Gain Muscle'
    case 'maintain_weight':
      return 'Maintain Weight'
    case 'improve_health':
      return 'Improve Health'
    case 'increase_strength':
      return 'Increase Strength'
    default:
      return 'Unknown Goal'
  }
}
```

#### Enhanced Goal Calories Card
```typescript
<Card className="border-border bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-900/20 dark:to-green-900/20">
  <CardHeader className="pb-3">
    <div className="flex items-center gap-2">
      <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <CardTitle className="text-sm font-medium">Goal Calories</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
      {analytics.goalCalories}
    </div>
    <div className="flex items-center gap-2 mt-1">
      <p className="text-xs text-muted-foreground">
        {getGoalDisplayText(analytics.userGoal)} {/* Shows goal name ✅ */}
      </p>
      {analytics.targetWeeklyWeightChange !== 0 && (
        <Badge variant="outline" className="text-xs">
          {analytics.targetWeeklyWeightChange > 0 ? '+' : ''}{analytics.targetWeeklyWeightChange} kg/week
        </Badge>
      )}
    </div>
  </CardContent>
</Card>
```

## Goal-Based Targets

### Weight Loss Goals

**Goal:** `lose_weight`
- **Target:** -0.5 kg/week
- **Calorie Adjustment:** -550 cal/day (deficit)
- **Reasoning:** Sustainable, healthy weight loss (0.5-1 kg/week recommended)

**Example:**
```
Maintenance: 2,500 cal/day
Goal: 2,500 - 550 = 1,950 cal/day ✅
```

### Muscle Gain Goals

**Goals:** `gain_muscle`, `increase_strength`
- **Target:** +0.25 kg/week
- **Calorie Adjustment:** +275 cal/day (surplus)
- **Reasoning:** Lean muscle gain with minimal fat gain (slow bulk)

**Example:**
```
Maintenance: 2,500 cal/day
Goal: 2,500 + 275 = 2,775 cal/day ✅
```

### Maintenance Goals

**Goals:** `maintain_weight`, `improve_health`
- **Target:** 0 kg/week
- **Calorie Adjustment:** 0 cal/day (maintenance)
- **Reasoning:** Maintain current weight, focus on health/composition

**Example:**
```
Maintenance: 2,500 cal/day
Goal: 2,500 + 0 = 2,500 cal/day ✅
```

## Benefits

### 1. **Automatic and Dynamic**
- ✅ No need to manually input target weight change
- ✅ Updates automatically when user changes their goal in profile
- ✅ One source of truth (profile)

### 2. **Consistent Experience**
- ✅ Goal from profile matches analytics calculations
- ✅ User sees their actual goal reflected in the UI
- ✅ Reduced confusion and manual configuration

### 3. **Simplified API**
- ✅ Cleaner API with fewer parameters
- ✅ Less room for user error (wrong target input)
- ✅ Better encapsulation (goal logic in backend)

### 4. **Better UX**
- ✅ Users see their goal name displayed clearly
- ✅ Target weight change badge shows when applicable
- ✅ Visual feedback aligns with profile settings

## User Workflow

### Step 1: Set Goal in Profile
User goes to Profile page and selects their goal:
```
Profile → Goals: "Lose Weight" ✅
```

### Step 2: View Analytics
Analytics automatically uses the selected goal:
```
Dashboard → Analytics
Goal Calories: 1,950 cal/day
Based on: "Lose Weight" (-0.5 kg/week) ✅
```

### Step 3: Update Goal (Optional)
If user changes their mind:
```
Profile → Goals: "Gain Muscle" ✅
```

Analytics updates automatically:
```
Dashboard → Analytics
Goal Calories: 2,775 cal/day
Based on: "Gain Muscle" (+0.25 kg/week) ✅
```

## Calculation Examples

### Example 1: Weight Loss
```
User Profile:
- Goal: lose_weight
- Current Weight: 75 kg

Analytics Calculation:
1. Fetch profile → goal = "lose_weight"
2. Set target = -0.5 kg/week
3. Calculate adjustment = (-0.5 × 7700) / 7 = -550 cal/day
4. Maintenance = 2,500 cal/day (calculated from logs)
5. Goal Calories = 2,500 - 550 = 1,950 cal/day ✅

UI Display:
"Goal Calories: 1,950"
"Lose Weight" badge with "-0.5 kg/week"
```

### Example 2: Muscle Gain
```
User Profile:
- Goal: gain_muscle
- Current Weight: 65 kg

Analytics Calculation:
1. Fetch profile → goal = "gain_muscle"
2. Set target = +0.25 kg/week
3. Calculate adjustment = (0.25 × 7700) / 7 = +275 cal/day
4. Maintenance = 2,200 cal/day (calculated from logs)
5. Goal Calories = 2,200 + 275 = 2,475 cal/day ✅

UI Display:
"Goal Calories: 2,475"
"Gain Muscle" badge with "+0.25 kg/week"
```

### Example 3: Maintain Weight
```
User Profile:
- Goal: maintain_weight
- Current Weight: 70 kg

Analytics Calculation:
1. Fetch profile → goal = "maintain_weight"
2. Set target = 0 kg/week
3. Calculate adjustment = (0 × 7700) / 7 = 0 cal/day
4. Maintenance = 2,300 cal/day (calculated from logs)
5. Goal Calories = 2,300 + 0 = 2,300 cal/day ✅

UI Display:
"Goal Calories: 2,300"
"Maintain Weight" (no badge since target = 0)
```

## Safety Limits Still Apply

Even with profile-based goals, safety limits are enforced:

```typescript
// Unrealistic data detection
if (Math.abs(dailyEnergyImbalance) > 3000) {
  isDataRealistic = false
  maintenanceCalories = avgDailyCalories
}

// Calorie bounds
maintenanceCalories = Math.max(1200, Math.min(4000, maintenanceCalories))
goalCalories = Math.max(1200, Math.min(4000, goalCalories))
```

## Customization Options (Future Enhancement)

If users want more control, you can add:

### Option 1: Custom Target Override
Allow users to override the default target:
```typescript
// In profile schema
customWeeklyTarget?: number // Optional override
```

### Option 2: Aggressive/Conservative Mode
Let users choose their pace:
```typescript
// For lose_weight goal:
- Conservative: -0.3 kg/week
- Normal: -0.5 kg/week (current default)
- Aggressive: -0.75 kg/week
```

### Option 3: Activity-Based Adjustment
Adjust target based on activity level:
```typescript
if (profile.activityLevel === 'very_active') {
  // Can handle larger deficit/surplus
  targetWeeklyWeightChange *= 1.5
}
```

## Testing

### Test Case 1: Weight Loss Goal
```
Profile: goals = "lose_weight"
Expected: targetWeeklyWeightChange = -0.5
Expected: goalCalories = maintenance - 550
```

### Test Case 2: Muscle Gain Goal
```
Profile: goals = "gain_muscle"
Expected: targetWeeklyWeightChange = 0.25
Expected: goalCalories = maintenance + 275
```

### Test Case 3: Maintenance Goal
```
Profile: goals = "maintain_weight"
Expected: targetWeeklyWeightChange = 0
Expected: goalCalories = maintenance
```

### Test Case 4: Profile Not Found
```
No profile in DB
Expected: TRPCError with code 'NOT_FOUND'
```

## Summary

✅ **Before:** Manual `targetWeeklyWeightChange` input required
✅ **After:** Automatic based on user's profile goal

✅ **Before:** Potential mismatch between profile goal and analytics
✅ **After:** Single source of truth (profile)

✅ **Before:** Generic goal display
✅ **After:** Personalized with goal name and target badge

The system now provides a seamless, automated experience where the user's profile goal drives all calorie calculations! 🎯

