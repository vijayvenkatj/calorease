# Seed Data Scripts

## Overview
Scripts to populate the database with sample data for testing and development.

## User Data Seed
Creates 7 days of food logs and weight tracking data for a specific user.

**User ID:** `c90c6159-bcf3-4993-8967-44aa4d5d08b3`

### What Gets Created

#### Food Logs (7 days × ~5 meals = 35 entries)
- **Breakfast** (~400-500 cal): Oatmeal, eggs, yogurt, pancakes, avocado toast
- **Lunch** (~580-720 cal): Salads, sandwiches, bowls, burritos
- **Dinner** (~650-750 cal): Steak, chicken, pasta, salmon
- **Snacks** (1-2 per day, ~180-280 cal each): Protein shakes, nuts, fruit

**Daily totals:** 2,100-2,200 calories per day (meets 2000+ requirement)

#### Weight Logs (4 entries)
- Weight measurements every other day
- Range: 74.6 - 75.2 kg (simulates slight variation)
- Includes notes for first and last entries

### Option 1: Run SQL Directly (Easiest)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `seed-user-data.sql`
5. Click **Run**

✅ Done! Data will be inserted immediately.

### Option 2: Run TypeScript Script

#### Prerequisites
```bash
npm install tsx --save-dev
```

#### Set Environment Variable
Make sure `DATABASE_URL` is set in your `.env.local`:
```env
DATABASE_URL=your_postgres_connection_string
```

#### Run the Script
```bash
npx tsx scripts/seed-user-data.ts
```

The script will:
- Generate random meal combinations
- Insert food logs with timestamps
- Insert weight logs
- Show progress in the terminal
- Display summary statistics

### Verify the Data

#### Check Food Logs
```sql
SELECT 
  DATE(logged_at) as date,
  COUNT(*) as meals,
  SUM(calories::numeric) as total_calories
FROM food_logs 
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3'
GROUP BY DATE(logged_at)
ORDER BY date DESC;
```

Expected output: 7 days with 2000-2200 calories each

#### Check Weight Logs
```sql
SELECT date, weight, notes
FROM weight_logs
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3'
ORDER BY date DESC;
```

Expected output: 4 weight entries

### What You Can Test After Seeding

#### Dashboard
- ✅ Food logs appear in "Today's Food Log"
- ✅ Nutrition summary shows totals
- ✅ Stats cards populate with data

#### Analytics Section
- ✅ Weight trend graph displays
- ✅ Daily calorie chart shows bars
- ✅ Summary cards calculate:
  - Average daily calories (~2,150)
  - Total weight change (-0.6 kg)
  - Maintenance calories (calculated)
  - Goal calories (calculated)
- ✅ Personalized recommendations appear

#### Profile Page
- ✅ Update profile works
- ✅ All fields save correctly

### Clean Up (Optional)

To remove the seeded data:

```sql
DELETE FROM food_logs 
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3';

DELETE FROM weight_logs 
WHERE user_id = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3';
```

### Customize the Seed Data

#### Change User ID
Edit the `USER_ID` variable in either file:
```typescript
const USER_ID = 'your-user-id-here'
```

#### Change Date Range
Modify the loop in `seed-user-data.ts`:
```typescript
for (let day = 13; day >= 0; day--) {  // 14 days instead of 7
```

#### Adjust Calorie Targets
Modify meal samples or add more snacks in `seed-user-data.ts`

#### Add More Variety
Add meals to the `mealSamples` object:
```typescript
breakfast: [
  { name: 'Your Custom Meal', calories: 500, protein: 30, carbs: 50, fats: 15 },
  // ... more meals
]
```

## Troubleshooting

### "Table does not exist" Error
Run the database migrations first:
```bash
npx drizzle-kit push
```

Or create tables manually (see `SCHEMA_SETUP_GUIDE.md`)

### "Permission denied" Error
- Check your DATABASE_URL is correct
- Verify you have write permissions to the database
- Ensure the user exists in your auth system

### Script Hangs
- Check database connection
- Verify network access to Supabase
- Try the SQL version instead (more reliable)

## Tips

1. **Use SQL version for production** - More reliable and faster
2. **TypeScript version for development** - More flexible and randomized
3. **Run once** - The scripts don't check for duplicates
4. **Check analytics** - Best way to verify data is working correctly

## Next Steps

After seeding:
1. Login as the user (ID: `c90c6159-bcf3-4993-8967-44aa4d5d08b3`)
2. Navigate to dashboard
3. Scroll to "Progress Analytics" section
4. View the charts and recommendations
5. Try adding more food logs
6. Try logging weight
7. Watch analytics update in real-time

Enjoy testing! 🚀

---

## Food Items Database Seeding

### Overview
The `seed-food-items.ts` script populates the `food_items` table with 1000+ Indian food items from the `Food.csv` file. This creates a comprehensive food database that users can search and select from when logging meals.

### Prerequisites

1. **Run Database Migrations First:**
```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations to create the food_items table
npx drizzle-kit push
```

2. **Ensure Environment Variable:**
Make sure `DATABASE_URL` is set in your `.env.local`:
```env
DATABASE_URL=your_postgres_connection_string
```

### Running the Seed Script

```bash
npx tsx scripts/seed-food-items.ts
```

### What Gets Seeded

The script imports **1000+ food items** with complete nutritional data:

**Primary Nutrients:**
- Calories (kcal)
- Protein (g)
- Carbohydrates (g)
- Fats (g)

**Additional Nutrients:**
- Free Sugar (g)
- Fibre (g)
- Sodium (mg)
- Calcium (mg)
- Iron (mg)
- Vitamin C (mg)
- Folate (µg)

**Food Types Include:**
- Indian dishes (curries, rice dishes, breads)
- Beverages (tea, coffee, smoothies)
- Desserts and sweets
- Snacks and street food
- Traditional meals
- And much more!

### Script Behavior

The script will:
1. ✅ Read `Food.csv` from the scripts directory
2. ✅ Parse all 1000+ food items
3. ✅ Remove existing CSV-sourced items (keeps user custom foods)
4. ✅ Insert in batches of 100 for performance
5. ✅ Display progress during insertion
6. ✅ Show summary statistics

**Important:** Only items with `isCustom = 0` (from CSV) are cleared. User-created custom foods (`isCustom = 1`) are preserved.

### Verify the Data

```sql
-- Check total food items
SELECT COUNT(*) FROM food_items;
-- Expected: 1000+

-- Check CSV items vs custom items
SELECT 
  CASE WHEN is_custom = 0 THEN 'CSV Items' ELSE 'Custom Items' END as type,
  COUNT(*) as count
FROM food_items
GROUP BY is_custom;

-- Sample some foods
SELECT dish_name, calories, protein, carbohydrates, fats
FROM food_items
LIMIT 10;

-- Search for specific foods
SELECT dish_name, calories, protein
FROM food_items
WHERE dish_name ILIKE '%chicken%'
LIMIT 10;
```

### Using the Food Database

After seeding, users can:

1. **Search for Foods** - Type in the search box to find foods instantly
2. **View Nutritional Info** - See complete macro and micronutrient data
3. **Log with One Click** - Select a food to auto-fill nutritional values
4. **Adjust Serving Size** - Use multipliers (0.5, 1, 2, etc.)
5. **Create Custom Foods** - Add personal recipes not in the database

### Re-running the Script

You can safely re-run the script multiple times:
- It clears CSV items before inserting
- User custom foods are NOT affected
- Fresh data is loaded each time

### Troubleshooting

**"Table does not exist" Error:**
```bash
npx drizzle-kit push
```

**CSV File Not Found:**
- Ensure `Food.csv` is in the `scripts/` directory
- Check file path in the script

**Parsing Errors:**
- Check CSV format (comma-separated)
- Verify headers match expected format
- Look for malformed rows in the CSV

**Database Connection Issues:**
- Verify `DATABASE_URL` is correct
- Check network access to database
- Ensure database is running

### Clean Up

To remove all CSV-sourced food items:

```sql
DELETE FROM food_items WHERE is_custom = 0;
```

To remove ALL food items (including custom):

```sql
DELETE FROM food_items;
```

