# Calculation Safety Limits Fix

## Problem Identified

**Your Case:**
- Weight change: -8.5 kg
- Start: 75.2 kg → End: 66.7 kg
- Maintenance showed: 11,623 cal/day ❌
- Goal showed: 11,073 cal/day ❌

**Why This Happened:**
```
dailyDeficit = (-8.5 kg × 7,700 cal/kg) / 7 days
             = -65,450 / 7
             = -9,350 cal/day deficit

maintenance = avgCalories - (-9,350)
            = avgCalories + 9,350
            = ~2,000 + 9,350
            = ~11,350 cal/day ❌ UNREALISTIC!
```

## Root Cause

An **8.5 kg loss** in 7 days is:
- **Medically impossible** from fat loss alone
- Would require a 9,350 cal/day deficit
- Likely indicates:
  1. ✅ Weight entry typo (most common)
  2. ✅ Water weight fluctuation
  3. ✅ Scale calibration issue
  4. ✅ Wrong unit (pounds vs kg)

## Solution Implemented

### 1. Added Safety Limits

**Maximum Realistic Deficits:**
- Max deficit: 1,500 cal/day (≈ 1.5 kg/week loss)
- Max surplus: 1,000 cal/day (≈ 1 kg/week gain)
- If exceeded by >3,000 cal/day → flag as unrealistic

**Calorie Bounds:**
- Minimum: 1,200 cal/day (safe lower limit)
- Maximum: 4,000 cal/day (upper reasonable limit)

### 2. Fallback Logic

When data is unrealistic:
```typescript
if (Math.abs(dailyEnergyImbalance) > 3000) {
  isDataRealistic = false
  maintenanceCalories = avgDailyCalories  // Use average as fallback
}
```

### 3. Clamping

For realistic but extreme data:
```typescript
const clampedImbalance = Math.max(
  -maxRealisticSurplus,    // -1000
  Math.min(maxRealisticDeficit, dailyEnergyImbalance)  // 1500
)
```

## What Now Happens

### With Your Data (-8.5 kg loss):

**Step 1: Calculate imbalance**
```
dailyImbalance = (-8.5 × 7700) / 7 = -9,350 cal/day
```

**Step 2: Check if realistic**
```
|-9,350| > 3,000? YES → Flag as unrealistic
```

**Step 3: Fallback**
```
maintenance = avgDailyCalories (e.g., 2,100 cal/day) ✅
```

**Step 4: Calculate goal**
```
goal = 2,100 + (-0.5 × 7700 / 7)
     = 2,100 - 550
     = 1,550 cal/day ✅
```

**Step 5: Safety bounds**
```
maintenance = max(1200, min(4000, 2100)) = 2,100 ✅
goal = max(1200, min(4000, 1550)) = 1,550 ✅
```

**Result:** Now shows realistic values! ✅

### Expected Output

Instead of:
- ❌ Maintenance: 11,623
- ❌ Goal: 11,073

You'll see:
- ✅ Maintenance: ~2,100 cal/day
- ✅ Goal: ~1,550 cal/day
- ⚠️ **Warning banner** explaining the issue

## Warning Message

When data is unrealistic, users see:
```
⚠️ Data Quality Warning: Your weight change of -8.5 kg over 7 days 
seems unusually large. This could be due to:
• Incorrect weight entry (typo)
• Water weight fluctuation
• Scale calibration issues

The calculations are using your average intake as maintenance. 
Please verify your weight entries for accuracy.
```

## Realistic Examples

### Example 1: Normal Weight Loss
```
Weight change: -0.6 kg over 7 days
Daily deficit: (-0.6 × 7700) / 7 = -660 cal/day
Avg intake: 2,150 cal/day
Maintenance: 2,150 + 660 = 2,810 cal/day ✅
Goal: 2,810 - 550 = 2,260 cal/day ✅
```

### Example 2: Moderate Weight Loss
```
Weight change: -1.2 kg over 7 days
Daily deficit: (-1.2 × 7700) / 7 = -1,320 cal/day
Avg intake: 1,800 cal/day
Maintenance: 1,800 + 1,320 = 3,120 cal/day ✅
Goal: 3,120 - 550 = 2,570 cal/day ✅
```

### Example 3: Extreme Loss (Your Case)
```
Weight change: -8.5 kg over 7 days
Daily deficit: (-8.5 × 7700) / 7 = -9,350 cal/day
Avg intake: 2,000 cal/day
Check: |-9,350| > 3,000? YES → UNREALISTIC
Fallback: maintenance = 2,000 cal/day ✅
Goal: 2,000 - 550 = 1,450 cal/day ✅
Warning shown ⚠️
```

## Recommended Actions

### If You See This Warning:

1. **Check your weight entries**
   - Go to analytics section
   - Verify each weight log
   - Look for typos (e.g., 66.7 instead of 76.7?)

2. **Consider water weight**
   - First week often shows large loss due to water
   - Glycogen depletion: 2-3 kg water loss is normal
   - Wait another week for more accurate data

3. **Verify your scale**
   - Weigh at same time daily
   - Same conditions (morning, after bathroom)
   - Consistent surface (hard floor, not carpet)

4. **Check units**
   - Ensure using kg, not pounds
   - 8.5 lbs = 3.9 kg (more realistic)

### To Fix Your Data:

**Option 1: Delete incorrect weight log**
```sql
DELETE FROM weight_logs 
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3'
AND weight = 66.7;  -- The suspicious entry
```

**Option 2: Update incorrect weight**
```sql
UPDATE weight_logs 
SET weight = 74.7  -- Corrected value
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3'
AND weight = 66.7;
```

**Option 3: Wait for more data**
- Keep logging daily
- After 2-3 more weeks, calculations will be more accurate
- Short-term fluctuations smooth out

## Technical Details

### Safety Limits Implemented

```typescript
// Maximum realistic daily deficits/surpluses
const maxRealisticDeficit = 1500  // ~1.5 kg/week loss
const maxRealisticSurplus = 1000  // ~1 kg/week gain

// Check for unrealistic data
if (Math.abs(dailyEnergyImbalance) > 3000) {
  isDataRealistic = false
  maintenanceCalories = avgDailyCalories
}

// Clamp to realistic ranges
const clampedImbalance = Math.max(
  -maxRealisticSurplus,
  Math.min(maxRealisticDeficit, dailyEnergyImbalance)
)

// Bound final values
maintenanceCalories = Math.max(1200, Math.min(4000, maintenanceCalories))
goalCalories = Math.max(1200, Math.min(4000, goalCalories))
```

### New Response Field

API now returns:
```typescript
{
  // ... existing fields
  isDataRealistic: boolean  // true = calculations reliable
}
```

## Files Modified

1. `/src/server/api/routers/analytics.ts`
   - Added safety limits
   - Added clamping logic
   - Added `isDataRealistic` flag

2. `/src/components/analytics/AnalyticsCharts.tsx`
   - Added warning banner for unrealistic data
   - Shows when `isDataRealistic === false`

## Benefits

✅ Prevents wildly incorrect calculations
✅ Guides users to fix data errors
✅ Provides realistic fallback values
✅ Maintains functionality even with bad data
✅ Educational (teaches users about realistic rates)

## Summary

- **Problem:** -8.5 kg loss caused 11,000+ cal/day calculations
- **Cause:** Unrealistic weight change (likely data error)
- **Fix:** Added safety limits and data validation
- **Result:** Shows realistic values (~2,000 cal/day) with warning
- **Action:** Check your weight entries for typos!

The graphs will now reflect realistic, bounded values! 📊

