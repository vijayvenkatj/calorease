import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { foodLogs, weightLogs } from '../src/lib/db/schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL not found')
}

const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

const USER_ID = 'c90c6159-bcf3-4993-8967-44aa4d5d08b3'

// Sample meals with realistic nutritional data
const mealSamples = {
  breakfast: [
    { name: 'Oatmeal with Banana & Almonds', calories: 450, protein: 15, carbs: 65, fats: 15 },
    { name: 'Scrambled Eggs & Toast', calories: 520, protein: 28, carbs: 45, fats: 22 },
    { name: 'Greek Yogurt Parfait', calories: 380, protein: 25, carbs: 48, fats: 10 },
    { name: 'Protein Pancakes with Berries', calories: 480, protein: 30, carbs: 55, fats: 12 },
    { name: 'Avocado Toast & Poached Eggs', calories: 510, protein: 22, carbs: 42, fats: 28 },
  ],
  lunch: [
    { name: 'Grilled Chicken Caesar Salad', calories: 650, protein: 45, carbs: 35, fats: 32 },
    { name: 'Turkey & Cheese Sandwich', calories: 580, protein: 38, carbs: 52, fats: 22 },
    { name: 'Quinoa Buddha Bowl', calories: 620, protein: 28, carbs: 75, fats: 24 },
    { name: 'Beef Burrito Bowl', calories: 720, protein: 42, carbs: 68, fats: 30 },
    { name: 'Salmon & Rice Bowl', calories: 680, protein: 40, carbs: 62, fats: 28 },
  ],
  dinner: [
    { name: 'Grilled Steak with Vegetables', calories: 750, protein: 52, carbs: 45, fats: 38 },
    { name: 'Chicken Stir-Fry with Rice', calories: 680, protein: 48, carbs: 72, fats: 20 },
    { name: 'Pasta with Meat Sauce', calories: 720, protein: 42, carbs: 85, fats: 25 },
    { name: 'Baked Salmon with Potatoes', calories: 650, protein: 46, carbs: 58, fats: 24 },
    { name: 'Turkey Meatballs & Spaghetti', calories: 700, protein: 45, carbs: 78, fats: 22 },
  ],
  snack: [
    { name: 'Protein Shake', calories: 280, protein: 30, carbs: 25, fats: 8 },
    { name: 'Apple with Peanut Butter', calories: 220, protein: 8, carbs: 28, fats: 12 },
    { name: 'Mixed Nuts', calories: 200, protein: 6, carbs: 8, fats: 18 },
    { name: 'Protein Bar', calories: 250, protein: 20, carbs: 30, fats: 8 },
    { name: 'Greek Yogurt with Honey', calories: 180, protein: 18, carbs: 22, fats: 4 },
  ],
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getDateNDaysAgo(n: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - n)
  date.setHours(8, 0, 0, 0) // Start at 8 AM
  return date
}

async function seedUserData() {
  console.log('🌱 Seeding data for user:', USER_ID)
  console.log('📅 Creating 7 days of food logs...\n')

  const foodLogEntries = []
  const weightLogEntries = []

  // Generate data for the last 7 days
  for (let day = 6; day >= 0; day--) {
    const baseDate = getDateNDaysAgo(day)
    const dateStr = baseDate.toISOString().split('T')[0]
    
    let dailyCalories = 0
    let dailyProtein = 0
    let dailyCarbs = 0
    let dailyFats = 0

    console.log(`Day ${7 - day} (${dateStr}):`)

    // Breakfast (8 AM)
    const breakfast = getRandomItem(mealSamples.breakfast)
    const breakfastTime = new Date(baseDate)
    breakfastTime.setHours(8, Math.floor(Math.random() * 30), 0, 0)
    
    foodLogEntries.push({
      userId: USER_ID,
      mealType: 'breakfast',
      foodName: breakfast.name,
      calories: String(breakfast.calories),
      protein: String(breakfast.protein),
      carbs: String(breakfast.carbs),
      fats: String(breakfast.fats),
      loggedAt: breakfastTime,
    })
    
    dailyCalories += breakfast.calories
    dailyProtein += breakfast.protein
    dailyCarbs += breakfast.carbs
    dailyFats += breakfast.fats
    
    console.log(`  🌅 Breakfast: ${breakfast.name} (${breakfast.calories} cal)`)

    // Lunch (12:30 PM)
    const lunch = getRandomItem(mealSamples.lunch)
    const lunchTime = new Date(baseDate)
    lunchTime.setHours(12, 30 + Math.floor(Math.random() * 30), 0, 0)
    
    foodLogEntries.push({
      userId: USER_ID,
      mealType: 'lunch',
      foodName: lunch.name,
      calories: String(lunch.calories),
      protein: String(lunch.protein),
      carbs: String(lunch.carbs),
      fats: String(lunch.fats),
      loggedAt: lunchTime,
    })
    
    dailyCalories += lunch.calories
    dailyProtein += lunch.protein
    dailyCarbs += lunch.carbs
    dailyFats += lunch.fats
    
    console.log(`  🌞 Lunch: ${lunch.name} (${lunch.calories} cal)`)

    // Dinner (7 PM)
    const dinner = getRandomItem(mealSamples.dinner)
    const dinnerTime = new Date(baseDate)
    dinnerTime.setHours(19, Math.floor(Math.random() * 30), 0, 0)
    
    foodLogEntries.push({
      userId: USER_ID,
      mealType: 'dinner',
      foodName: dinner.name,
      calories: String(dinner.calories),
      protein: String(dinner.protein),
      carbs: String(dinner.carbs),
      fats: String(dinner.fats),
      loggedAt: dinnerTime,
    })
    
    dailyCalories += dinner.calories
    dailyProtein += dinner.protein
    dailyCarbs += dinner.carbs
    dailyFats += dinner.fats
    
    console.log(`  🌙 Dinner: ${dinner.name} (${dinner.calories} cal)`)

    // Add 1-2 snacks per day to reach 2000+ calories
    const numSnacks = dailyCalories < 1800 ? 2 : 1
    
    for (let i = 0; i < numSnacks; i++) {
      const snack = getRandomItem(mealSamples.snack)
      const snackTime = new Date(baseDate)
      const snackHour = i === 0 ? 10 : 15 // Morning or afternoon snack
      snackTime.setHours(snackHour, Math.floor(Math.random() * 60), 0, 0)
      
      foodLogEntries.push({
        userId: USER_ID,
        mealType: 'snack',
        foodName: snack.name,
        calories: String(snack.calories),
        protein: String(snack.protein),
        carbs: String(snack.carbs),
        fats: String(snack.fats),
        loggedAt: snackTime,
      })
      
      dailyCalories += snack.calories
      dailyProtein += snack.protein
      dailyCarbs += snack.carbs
      dailyFats += snack.fats
      
      console.log(`  🍎 Snack: ${snack.name} (${snack.calories} cal)`)
    }

    console.log(`  📊 Daily Total: ${dailyCalories} cal (P: ${dailyProtein}g, C: ${dailyCarbs}g, F: ${dailyFats}g)\n`)

    // Add weight log every other day (4 entries total)
    if (day % 2 === 0 || day === 0) {
      const weightDate = new Date(baseDate)
      weightDate.setHours(7, 0, 0, 0) // Morning weigh-in
      
      // Simulate slight weight variation (between 74-76 kg)
      const baseWeight = 75
      const variation = (Math.random() - 0.5) * 2 // -1 to +1 kg
      const weight = baseWeight + variation
      
      weightLogEntries.push({
        userId: USER_ID,
        weight: weight.toFixed(1),
        date: dateStr,
        notes: day === 6 ? 'Starting weight' : day === 0 ? 'Week complete!' : null,
        loggedAt: weightDate,
      })
      
      console.log(`  ⚖️  Weight: ${weight.toFixed(1)} kg`)
      console.log('')
    }
  }

  // Insert all food logs
  console.log('💾 Inserting food logs into database...')
  await db.insert(foodLogs).values(foodLogEntries)
  console.log(`✅ Inserted ${foodLogEntries.length} food log entries`)

  // Insert all weight logs
  console.log('💾 Inserting weight logs into database...')
  await db.insert(weightLogs).values(weightLogEntries)
  console.log(`✅ Inserted ${weightLogEntries.length} weight log entries`)

  console.log('\n🎉 Seeding complete!')
  console.log(`\n📈 Summary:`)
  console.log(`   - Food logs: ${foodLogEntries.length} entries over 7 days`)
  console.log(`   - Weight logs: ${weightLogEntries.length} entries`)
  console.log(`   - Average daily calories: ~2100-2200`)
  console.log(`\n🔍 You can now:`)
  console.log(`   1. View food logs on the dashboard`)
  console.log(`   2. See analytics and charts`)
  console.log(`   3. Get calculated maintenance & goal calories`)
  
  await sql.end()
}

seedUserData().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})

