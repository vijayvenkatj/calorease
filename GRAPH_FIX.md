# Graph Fix - Analytics Charts

## Problem
The daily calorie chart was not rendering properly because it was trying to use a `Line` component inside a `BarChart`, which is not supported by recharts.

## Root Cause
In `AnalyticsCharts.tsx`, the code attempted to add a goal line to a bar chart:
```tsx
<BarChart>
  <Bar dataKey="calories" ... />
  <Line dataKey="goal" ... />  // ❌ Not supported!
</BarChart>
```

Recharts doesn't allow mixing `Line` and `Bar` in a `BarChart` component.

## Solution
Changed from `BarChart` to `ComposedChart` and used `ReferenceLine` for the goal:

### Before (BROKEN):
```tsx
<BarChart data={...}>
  <Bar dataKey="calories" name="Actual Calories" />
  <Line dataKey="goal" name="Goal Calories" />
</BarChart>
```

### After (FIXED):
```tsx
<ComposedChart data={analytics.dailyCalories}>
  <Bar dataKey="calories" name="Actual Calories" />
  <ReferenceLine 
    y={analytics.goalCalories} 
    stroke="hsl(142 76% 36%)"
    strokeDasharray="5 5"
    label={{ value: `Goal: ${analytics.goalCalories} cal` }}
  />
</ComposedChart>
```

## Changes Made

### 1. Updated Imports
```tsx
// Added ComposedChart and ReferenceLine
import { 
  LineChart, Line, BarChart, Bar, 
  ComposedChart,  // ← Added
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, 
  ReferenceLine  // ← Added
} from 'recharts'
```

### 2. Changed Chart Type
- `BarChart` → `ComposedChart`
- Removed the goal mapping from data
- Changed `Line` to `ReferenceLine`

## Benefits of This Approach

### ComposedChart
- ✅ Allows mixing different chart types (Bar, Line, Area, etc.)
- ✅ Better for complex visualizations
- ✅ Same API as BarChart

### ReferenceLine
- ✅ Better for showing goal/target lines
- ✅ Horizontal line at specific Y value
- ✅ Doesn't require data mapping
- ✅ Cleaner label positioning
- ✅ More performant (doesn't render points)

## What Now Works

### Weight Trend Graph
- ✅ Line chart showing weight over time
- ✅ Smooth curve connecting data points
- ✅ Hover tooltips with dates
- ✅ Auto-scaled Y-axis

### Daily Calorie Graph
- ✅ Bar chart showing daily intake
- ✅ Horizontal goal line (dashed green)
- ✅ Label showing goal value
- ✅ Hover tooltips with dates
- ✅ Proper legend

## Testing

To verify the fix works:

1. **Run the seed script** to populate data
2. **Navigate to dashboard** and scroll to analytics
3. **Check both graphs render**:
   - Weight trend: Line graph with points
   - Daily calories: Bars with dashed goal line
4. **Hover over charts** to see tooltips
5. **Verify responsiveness** on different screen sizes

## Expected Behavior

### Weight Trend Chart
```
75.2 kg ●━━━●
        ╲  ╱
74.8 kg  ●━●
         ╲
74.6 kg   ●
```

### Daily Calorie Chart
```
          Goal: 2,260 cal --------
2,150 cal ███
2,100 cal ██
2,200 cal ████
2,150 cal ███
...
```

## Technical Details

### ComposedChart Props
- `data`: Array of daily calorie objects
- Same as BarChart, but supports mixed types

### ReferenceLine Props
- `y`: Numeric value for horizontal line
- `stroke`: Line color
- `strokeDasharray`: Dash pattern (e.g., "5 5")
- `label`: Object with label configuration
  - `value`: Text to display
  - `position`: Where to place label
  - `fill`: Label color
  - `fontSize`: Label size
  - `fontWeight`: Label weight

## No Breaking Changes

- ✅ All existing props still work
- ✅ Data format unchanged
- ✅ Other features unaffected
- ✅ Styling preserved
- ✅ Responsive behavior maintained

## Files Modified

- `/src/components/analytics/AnalyticsCharts.tsx`
  - Line 6: Updated imports
  - Line 216-265: Changed chart implementation

## Related Documentation

- [Recharts ComposedChart](https://recharts.org/en-US/api/ComposedChart)
- [Recharts ReferenceLine](https://recharts.org/en-US/api/ReferenceLine)

The graphs should now render correctly! 🎉

