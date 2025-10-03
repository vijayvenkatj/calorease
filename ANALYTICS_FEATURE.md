# Weight & Calorie Analytics Feature

## Overview
A comprehensive analytics system that tracks user weight and calorie intake over time, calculates maintenance calories, and provides personalized goal recommendations based on scientific formulas.

## Features Implemented

### 1. Weight Tracking
- **Daily Weight Logging**: Users can log their weight with optional notes
- **Weight Trend Visualization**: Line chart showing weight changes over time
- **Weight Change Calculation**: Automatic calculation of total weight change

### 2. Calorie Analytics
- **Daily Calorie Tracking**: Automatically aggregates food logs per day
- **Average Calculation**: Computes average daily calorie intake
- **Visual Comparison**: Bar chart comparing actual intake vs goal calories

### 3. Smart Calculations

#### Average Daily Calories
```
avgDailyCalories = totalCalories / daysLogged
```

#### Total Weight Change
```
totalWeightChange = endWeight - startWeight (in kg)
```

#### Maintenance Calories
Uses the energy balance equation:
```
maintenanceCalories = avgCalories - (weightChange × 7700 / daysLogged)
```
Where:
- 7700 calories ≈ 1 kg of body weight
- Formula adjusts average intake based on actual weight change
- Requires minimum 7 days of data and 2 weight entries

#### Goal Calories
Calculates target intake for desired weekly weight change:
```
goalCalories = maintenanceCalories - (targetWeightLoss × 7700 / 7)
```
Where:
- targetWeightLoss is in kg/week (negative for loss, positive for gain)
- Divides weekly target by 7 to get daily adjustment
- Default target: -0.5 kg/week (safe weight loss)

### 4. Visual Analytics

#### Weight Trend Graph
- **Type**: Line chart with recharts
- **Data**: Weight measurements over selected period
- **Features**:
  - X-axis: Dates (formatted as M/D)
  - Y-axis: Weight in kg (auto-scaled)
  - Smooth line connecting data points
  - Hover tooltips with detailed info
  - Badge showing total change

#### Daily Calorie Graph
- **Type**: Bar chart with goal line overlay
- **Data**: Daily calorie intake + goal line
- **Features**:
  - Bars: Actual calorie intake per day
  - Dashed line: Goal calories
  - Color-coded bars
  - Hover tooltips
  - Legend

### 5. Personalized Recommendations
When sufficient data is available (≥7 days, ≥2 weight entries):
- Calculated maintenance calories
- Suggested daily calorie goal
- Target weekly weight change
- Safety tips and guidance

## Database Schema

### Weight Logs Table (`weight_logs`)
```sql
CREATE TABLE "weight_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "weight" numeric(5, 2) NOT NULL,
  "date" text NOT NULL,
  "notes" text,
  "logged_at" timestamp DEFAULT now() NOT NULL
);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: References auth.users.id
- `weight`: Weight in kg (precision: 5,2)
- `date`: ISO date string (YYYY-MM-DD)
- `notes`: Optional user notes
- `logged_at`: Timestamp of entry

## TRPC API Endpoints

### `analytics.addWeightLog`
Add a new weight entry.

**Input:**
```typescript
{
  weight: string, // Converted to number (20-500 kg)
  notes?: string  // Optional (max 500 chars)
}
```

**Returns:** Created weight log

### `analytics.getWeightLogs`
Get weight logs for a date range.

**Input:**
```typescript
{
  days: number  // 1-365, default: 7
}
```

**Returns:** Array of weight logs

### `analytics.getDailyCalories`
Get daily calorie totals for a date range.

**Input:**
```typescript
{
  days: number  // 1-365, default: 7
}
```

**Returns:** Array of daily calorie totals

### `analytics.getAnalytics`
Get comprehensive analytics with calculations.

**Input:**
```typescript
{
  days: number,                    // 7-365, default: 7
  targetWeeklyWeightChange: number // -2 to 2 kg/week, default: -0.5
}
```

**Returns:**
```typescript
{
  daysLogged: number,
  avgDailyCalories: number,
  totalWeightChange: number,
  startWeight: number,
  endWeight: number,
  maintenanceCalories: number,
  goalCalories: number,
  targetWeeklyWeightChange: number,
  hasEnoughData: boolean,
  weightLogs: Array<{ date: string, weight: number }>,
  dailyCalories: Array<{ date: string, calories: number }>
}
```

### `analytics.deleteWeightLog`
Delete a weight entry.

**Input:**
```typescript
{
  id: string  // UUID of weight log
}
```

**Returns:** Success status

## Components

### `WeightTracker`
**Location:** `src/components/analytics/WeightTracker.tsx`

**Purpose:** Form for logging daily weight

**Features:**
- Input for weight (kg)
- Optional notes field
- Validation (20-500 kg)
- Success/error notifications
- Loading states

**Props:** None (uses TRPC directly)

### `AnalyticsCharts`
**Location:** `src/components/analytics/AnalyticsCharts.tsx`

**Purpose:** Main analytics dashboard with charts and metrics

**Features:**
- 4 summary cards (avg calories, weight change, maintenance, goal)
- Weight trend line chart
- Daily calorie bar chart with goal overlay
- Personalized recommendations
- Data sufficiency warnings

**Props:**
```typescript
{
  days?: number,                    // Default: 7
  targetWeeklyWeightChange?: number // Default: -0.5
}
```

## Integration

### Dashboard Integration
The analytics section is added to the main dashboard:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-1">
    <WeightTracker />
  </div>
  <div className="lg:col-span-3">
    <AnalyticsCharts days={7} targetWeeklyWeightChange={-0.5} />
  </div>
</div>
```

### Auto-Refresh
Components automatically refresh when:
- New weight is logged
- Food logs are added/updated
- User navigates back to the page

## Usage Flow

### For Users

1. **Initial Setup** (Days 1-6):
   - Log food daily (existing feature)
   - Log weight at least twice during the week
   - System collects baseline data

2. **Week 1 Complete** (Day 7+):
   - View calculated maintenance calories
   - See personalized goal recommendations
   - Analyze weight and calorie trends

3. **Ongoing** (Week 2+):
   - Continue logging food and weight
   - Track progress against goals
   - Adjust targets as needed

### Data Requirements

**Minimum for Basic Analytics:**
- 1 day of food logging
- 1 weight entry

**Minimum for Full Analytics:**
- 7 days of food logging
- 2+ weight entries (preferably start and end of week)

**Optimal:**
- Daily food logging
- Weight entries 2-3 times per week

## Scientific Basis

### Energy Balance Equation
The foundation of the calculations:
```
Weight Change = (Calories In - Calories Out) / 7700
```

Where:
- 1 kg body weight ≈ 7700 calories
- Based on energy density of body tissue
- Accounts for both fat and lean mass

### Maintenance Calories
Represents Total Daily Energy Expenditure (TDEE):
```
TDEE = BMR + Activity Energy + TEF
```

Our formula reverse-engineers this from actual data:
- Takes average intake
- Adjusts for observed weight change
- Produces personalized TDEE estimate

### Safe Weight Loss Guidelines
- **Recommended:** 0.5-1 kg/week (1-2 lbs/week)
- **Maximum:** 1.5 kg/week for obese individuals
- **Minimum calories:** 1200 for women, 1500 for men

## Error Handling

### Insufficient Data
When `hasEnoughData === false`:
- Display warning message
- Show available data
- Prompt to continue logging

### No Data
When no logs exist:
- Friendly empty state
- Instructions to start logging
- Quick action buttons

### API Errors
All endpoints include:
- Try-catch blocks
- Proper error types (TRPCError)
- User-friendly error messages
- Toast notifications

## Performance Considerations

### Database Queries
- Indexed by user_id and date
- Date range filtering at DB level
- Aggregations use SQL (not JS)
- Efficient ordering

### Client-Side
- Data fetching with React Query (via TRPC)
- Automatic caching
- Optimistic updates
- Stale-while-revalidate pattern

### Chart Rendering
- Recharts with ResponsiveContainer
- Auto-scaling axes
- Efficient re-renders
- Lazy loading consideration

## Future Enhancements

### Potential Additions
1. **Macro-based calculations**
   - Protein/carb/fat goals
   - Macro-specific recommendations

2. **Body composition tracking**
   - Body fat percentage
   - Muscle mass estimates
   - Waist-to-hip ratio

3. **Predictive analytics**
   - Projected weight at current pace
   - Goal achievement date estimates
   - Trend forecasting

4. **Export functionality**
   - CSV export of data
   - PDF reports
   - Share progress images

5. **Goal templates**
   - Pre-set goals (cutting, bulking, maintenance)
   - Sport-specific recommendations
   - Age/gender adjustments

6. **Advanced visualizations**
   - Moving averages
   - Correlation charts (weight vs calories)
   - Weekly/monthly aggregates

7. **Reminders & Notifications**
   - Daily weight reminder
   - Goal achievement alerts
   - Streak notifications

## Testing Checklist

- [ ] Add weight log successfully
- [ ] View weight trend chart
- [ ] View calorie chart
- [ ] Calculate maintenance calories (with 7+ days data)
- [ ] Calculate goal calories
- [ ] Display "need more data" message (< 7 days)
- [ ] Delete weight log
- [ ] Handle no data state
- [ ] Handle API errors gracefully
- [ ] Responsive design on mobile
- [ ] Charts render correctly
- [ ] Tooltips work on hover
- [ ] Auto-refresh after logging

## Troubleshooting

### Charts not displaying
- Check data is present in API response
- Verify recharts is installed
- Check browser console for errors

### Calculations seem wrong
- Verify minimum 7 days of data
- Check weight entries exist
- Ensure food logs have calories

### Performance issues
- Check query efficiency
- Verify date range isn't too large
- Consider pagination for large datasets

## Dependencies

- **recharts**: ^3.2.1 (charts)
- **@tanstack/react-query**: Via TRPC (data fetching)
- **date-fns**: For date manipulation (if needed)
- **lucide-react**: Icons

## Conventions Followed

### Next.js
✅ Server components for pages
✅ Client components for interactivity
✅ Server actions for mutations
✅ Proper data fetching patterns

### Database
✅ Drizzle ORM
✅ Type-safe queries
✅ Proper indexing
✅ Efficient aggregations

### API
✅ TRPC for type safety
✅ Zod validation
✅ Error handling
✅ Authentication checks

### UI/UX
✅ Consistent design system
✅ Loading states
✅ Error states
✅ Empty states
✅ Responsive design
✅ Accessible components

