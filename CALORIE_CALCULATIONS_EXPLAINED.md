# Calorie Calculations Explained

## Overview
The analytics feature calculates your maintenance calories (TDEE) and goal calories based on actual data from your food logs and weight tracking.

## The Math Behind It

### Constants
- **1 kg of body weight ≈ 7,700 calories**
  - This is the energy equivalent of body tissue (mix of fat and lean mass)
  - Fat has ~7,700 cal/kg, muscle has ~1,100 cal/kg
  - Average body composition change ≈ 7,700 cal/kg

### Formula 1: Average Daily Calories
```
avgDailyCalories = totalCalories / daysLogged
```

**Example:**
- 7 days of logging
- Total: 15,000 calories
- Average: 15,000 / 7 = **2,143 cal/day**

---

### Formula 2: Maintenance Calories (TDEE)
```
maintenanceCalories = avgCalories - (weightChange × 7700 / daysLogged)
```

#### How It Works:
1. Calculate daily energy imbalance from weight change
2. Adjust average intake to find maintenance level

#### Example 1: Weight Loss
**Data:**
- Ate 2,100 cal/day for 7 days
- Lost 0.5 kg

**Calculation:**
```
dailyDeficit = (-0.5 kg × 7,700 cal/kg) / 7 days
             = -3,850 / 7
             = -550 cal/day

maintenanceCalories = 2,100 - (-550)
                    = 2,100 + 550
                    = 2,650 cal/day
```

**Interpretation:**
- You ate 2,100 cal/day
- You lost weight (had a deficit)
- Your maintenance is 550 cal higher = **2,650 cal/day**

#### Example 2: Weight Gain
**Data:**
- Ate 2,500 cal/day for 7 days
- Gained 0.3 kg

**Calculation:**
```
dailySurplus = (+0.3 kg × 7,700 cal/kg) / 7 days
             = +2,310 / 7
             = +330 cal/day

maintenanceCalories = 2,500 - (+330)
                    = 2,500 - 330
                    = 2,170 cal/day
```

**Interpretation:**
- You ate 2,500 cal/day
- You gained weight (had a surplus)
- Your maintenance is 330 cal lower = **2,170 cal/day**

#### Example 3: No Weight Change
**Data:**
- Ate 2,200 cal/day for 7 days
- Weight stayed the same (0 kg change)

**Calculation:**
```
dailyImbalance = (0 kg × 7,700) / 7 days
               = 0 cal/day

maintenanceCalories = 2,200 - 0
                    = 2,200 cal/day
```

**Interpretation:**
- You ate 2,200 cal/day
- Weight didn't change
- Your maintenance = **2,200 cal/day**

---

### Formula 3: Goal Calories
```
goalCalories = maintenanceCalories - (targetWeightChange × 7700 / 7)
```

#### How It Works:
1. Start with your maintenance (from Formula 2)
2. Adjust for desired weekly weight change
3. Divide by 7 to get daily adjustment

#### Example 1: Weight Loss Goal
**Data:**
- Maintenance: 2,650 cal/day (from Formula 2)
- Target: Lose 0.5 kg/week

**Calculation:**
```
dailyAdjustment = (-0.5 kg × 7,700 cal/kg) / 7 days
                = -3,850 / 7
                = -550 cal/day

goalCalories = 2,650 - (-550)
             = 2,650 + 550
             = 3,200 cal/day
```

Wait, this doesn't make sense for weight loss! Let me fix this:

**Correct Calculation:**
```
dailyDeficit = (0.5 kg × 7,700 cal/kg) / 7 days  // Note: positive for loss
             = 3,850 / 7
             = 550 cal/day

goalCalories = 2,650 - 550
             = 2,100 cal/day
```

**Interpretation:**
- Your maintenance: 2,650 cal/day
- To lose 0.5 kg/week, eat 550 cal less
- Goal: **2,100 cal/day**

#### Example 2: Weight Gain Goal
**Data:**
- Maintenance: 2,400 cal/day
- Target: Gain 0.3 kg/week

**Calculation:**
```
dailySurplus = (0.3 kg × 7,700 cal/kg) / 7 days
             = 2,310 / 7
             = 330 cal/day

goalCalories = 2,400 + 330
             = 2,730 cal/day
```

**Interpretation:**
- Your maintenance: 2,400 cal/day
- To gain 0.3 kg/week, eat 330 cal more
- Goal: **2,730 cal/day**

---

## Real-World Example

### Scenario: Sarah's Week
**Sarah's Data:**
- Day 1-7: Averaged 2,150 calories/day
- Start weight: 75.0 kg
- End weight: 74.4 kg
- Weight change: -0.6 kg
- Target: Lose 0.5 kg/week

### Step 1: Average Daily Calories
```
avgDailyCalories = 2,150 cal/day (from her logs)
```

### Step 2: Calculate Maintenance
```
dailyDeficit = (-0.6 kg × 7,700) / 7 days
             = -4,620 / 7
             = -660 cal/day

maintenanceCalories = 2,150 - (-660)
                    = 2,150 + 660
                    = 2,810 cal/day
```

**What This Means:**
- Sarah ate 2,150 cal/day
- She lost 0.6 kg (had a 660 cal/day deficit)
- Her TDEE (maintenance) = **2,810 cal/day**

### Step 3: Calculate Goal for 0.5 kg/week Loss
```
targetDeficit = (0.5 kg × 7,700) / 7 days
              = 3,850 / 7
              = 550 cal/day

goalCalories = 2,810 - 550
             = 2,260 cal/day
```

**Recommendation:**
- Current intake: 2,150 cal/day (losing too fast at 0.6 kg/week)
- Maintenance: 2,810 cal/day
- Goal for healthy 0.5 kg/week loss: **2,260 cal/day**
- Sarah should **eat 110 more calories** per day for sustainable weight loss!

---

## Why These Formulas Work

### Energy Balance Equation
```
Weight Change = (Calories In - Calories Out) / 7700
```

Rearranging:
```
Calories Out = Calories In - (Weight Change × 7700 / Days)
```

This is exactly our maintenance formula!

### Key Insights

1. **Maintenance calories = What you burn daily**
   - If you eat this amount, weight stays stable
   - Also called TDEE (Total Daily Energy Expenditure)

2. **Weight loss requires a deficit**
   - Eat less than maintenance
   - Safe rate: 0.5-1.0 kg/week (500-1000 cal/day deficit)

3. **Weight gain requires a surplus**
   - Eat more than maintenance
   - Healthy rate: 0.25-0.5 kg/week (250-500 cal/day surplus)

---

## Common Questions

### Q: Why do I need 7 days of data?
**A:** More data = more accurate calculations. Weight fluctuates daily due to water, food, etc. A week smooths out these variations.

### Q: Why is my maintenance so high/low?
**A:** It depends on:
- Activity level (exercise, NEAT)
- Metabolism
- Body composition
- Accuracy of food logging

### Q: What if my weight didn't change much?
**A:** The calculation still works, but with less precision. The more weight change data, the better the estimate.

### Q: Can I trust these numbers?
**A:** They're estimates based on YOUR data. More accurate than generic calculators because they're personalized. Track for 2-3 weeks for best accuracy.

---

## Tips for Accurate Results

1. **Log consistently** - Every day, every meal
2. **Weigh regularly** - Same time, same conditions (morning, after bathroom)
3. **Be honest** - Accurate portions matter
4. **Give it time** - 2-3 weeks minimum for reliable data
5. **Adjust as needed** - If not losing/gaining as expected, recalculate

---

## Safety Limits

### Minimum Calories
- **Women:** 1,200 cal/day minimum
- **Men:** 1,500 cal/day minimum
- Below this risks nutrient deficiencies

### Maximum Weight Loss
- **Safe:** 0.5-1.0 kg/week
- **Maximum:** 1.5 kg/week (only if significantly overweight)
- Faster = muscle loss risk

### Maximum Weight Gain
- **Lean gain:** 0.25-0.5 kg/week
- **Faster gains** = more fat vs muscle

---

## Summary

The formulas work by:
1. Calculating your actual energy intake (average calories)
2. Measuring your actual results (weight change)
3. Reverse-engineering your maintenance calories
4. Adjusting for your specific goals

**This gives you PERSONALIZED recommendations based on YOUR body's response, not generic formulas!**

