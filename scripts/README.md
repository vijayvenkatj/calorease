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

