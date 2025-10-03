# Database Schema Setup Guide

## Issue
The `weight_logs` table needs to be created in your database for the analytics feature to work.

## Solution Options

### Option 1: Using Drizzle Kit (Recommended)
Try running the migration again:

```bash
npx drizzle-kit push
```

If it hangs or fails, try Option 2.

### Option 2: Manual SQL in Supabase Dashboard (Easy & Fast)

1. **Go to your Supabase Project Dashboard**
   - Navigate to https://supabase.com
   - Open your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run this SQL:**

```sql
-- Create weight_logs table
CREATE TABLE IF NOT EXISTS "weight_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"date" text NOT NULL,
	"notes" text,
	"logged_at" timestamp DEFAULT now() NOT NULL
);

-- Verify the table was created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'weight_logs';
```

4. **Click "Run"**

5. **Verify** - You should see `weight_logs` in the results.

### Option 3: Using psql Command Line

If you have psql installed:

```bash
psql "your-database-connection-string" -f MANUAL_MIGRATION.sql
```

### Option 4: Programmatic Migration

Run the migration script:

```bash
npx tsx scripts/migrate.ts
```

## Verification

After applying the migration, verify it worked:

### Check in Supabase Dashboard:
1. Go to "Table Editor"
2. Look for "weight_logs" table
3. You should see these columns:
   - id (uuid)
   - user_id (uuid)
   - weight (numeric)
   - date (text)
   - notes (text)
   - logged_at (timestamp)

### Check in Your App:
1. Start dev server: `npm run dev`
2. Go to the dashboard
3. Scroll to "Progress Analytics" section
4. Try logging a weight
5. If it works, the table was created successfully!

## Troubleshooting

### "Table already exists" error
This is fine! It means the table was already created. You can proceed.

### Connection timeout
- Check your DATABASE_URL environment variable
- Verify your Supabase project is running
- Check your network connection

### Permission denied
- Ensure you're using the correct database credentials
- Check that your Supabase API key has proper permissions

## What the Table Does

The `weight_logs` table stores:
- Daily weight measurements
- Optional notes about each measurement
- Date tracking for trend analysis
- User association for multi-user support

This powers:
- Weight trend graphs
- Maintenance calorie calculations
- Goal calorie recommendations
- Progress tracking over time

## Next Steps

Once the table is created:

1. ✅ Test weight logging feature
2. ✅ Log weight for at least 2 days
3. ✅ Log food for at least 7 days
4. ✅ View analytics and charts
5. ✅ Get personalized recommendations

## Need Help?

If you're still having issues:

1. Check the Supabase logs for errors
2. Verify DATABASE_URL is set correctly
3. Try restarting your dev server
4. Check the browser console for errors

The analytics feature will work once this table exists!

