# Calorie Formula Quick Reference

## ✅ CORRECTED Formulas (Per Day, Not Per Week!)

### 1. Average Daily Calories
```
avgDailyCalories = totalCalories / daysLogged
```
Simple average of what you ate.

---

### 2. Maintenance Calories (TDEE)
```
maintenanceCalories = avgCalories - (weightChange × 7700 / daysLogged)
```

**Example with seed data:**
- Ate: 2,150 cal/day average
- Weight change: -0.6 kg over 7 days
- Calculation:
  ```
  dailyImbalance = (-0.6 × 7700) / 7 = -660 cal/day
  maintenance = 2,150 - (-660) = 2,150 + 660 = 2,810 cal/day ✅
  ```
- **Result:** Your body burns **2,810 cal/day**

---

### 3. Goal Calories
```
goalCalories = maintenanceCalories + (targetWeightChange × 7700 / 7)
```

**Example for 0.5 kg/week loss:**
- Maintenance: 2,810 cal/day
- Target: -0.5 kg/week (weight loss)
- Calculation:
  ```
  dailyAdjustment = (-0.5 × 7700) / 7 = -550 cal/day
  goal = 2,810 + (-550) = 2,260 cal/day ✅
  ```
- **Result:** Eat **2,260 cal/day** to lose 0.5 kg/week

**Example for 0.3 kg/week gain:**
- Maintenance: 2,400 cal/day
- Target: +0.3 kg/week (weight gain)
- Calculation:
  ```
  dailyAdjustment = (+0.3 × 7700) / 7 = +330 cal/day
  goal = 2,400 + 330 = 2,730 cal/day ✅
  ```
- **Result:** Eat **2,730 cal/day** to gain 0.3 kg/week

---

## What Changed? 🔧

### Before (WRONG):
```javascript
goalCalories = maintenanceCalories - (targetWeightChange × 7700 / 7)
```
This had the sign backwards! For weight loss (negative target), it would ADD calories instead of SUBTRACT.

### After (CORRECT):
```javascript
goalCalories = maintenanceCalories + (targetWeightChange × 7700 / 7)
```
Now the sign is correct:
- Negative target (-0.5 kg) = adds negative value = **subtracts** calories ✅
- Positive target (+0.3 kg) = adds positive value = **adds** calories ✅

---

## Verify with Seed Data

Using the seed data (user: `c90c6159-bcf3-4993-8967-44aa4d5d08b3`):

**Input Data:**
- 7 days logged
- Average: ~2,150 cal/day
- Start weight: 75.2 kg
- End weight: 74.6 kg
- Weight change: -0.6 kg

**Expected Output:**
1. ✅ **Avg Daily:** ~2,150 calories
2. ✅ **Weight Change:** -0.6 kg
3. ✅ **Maintenance:** ~2,810 calories/day
   - Formula: 2,150 - (-0.6 × 7700 / 7) = 2,150 + 660 = 2,810
4. ✅ **Goal (for -0.5 kg/week):** ~2,260 calories/day
   - Formula: 2,810 + (-0.5 × 7700 / 7) = 2,810 - 550 = 2,260

---

## Safety Checks

All formulas now correctly return:
- ✅ **Daily** values (not weekly)
- ✅ **Realistic** ranges (1,500-3,500 cal/day typically)
- ✅ **Proper signs** (weight loss = lower calories)

---

## Test After Deploying

1. Run seed script to populate data
2. Navigate to dashboard analytics section
3. Verify displayed values match:
   - Maintenance: ~2,810 cal/day
   - Goal: ~2,260 cal/day (for default -0.5 kg/week)
4. These should be **daily** values, not weekly totals!

