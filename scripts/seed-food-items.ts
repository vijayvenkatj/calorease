import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'
import * as schema from '../src/lib/db/schema'

/**
 * Script to seed food items from Food.csv into the database
 * 
 * Run with: npx tsx scripts/seed-food-items.ts
 */

// Load environment variables from .env.local or .env
const envPath = path.join(__dirname, '..', '.env.local')
const envPathFallback = path.join(__dirname, '..', '.env')
config({ path: fs.existsSync(envPath) ? envPath : envPathFallback })

// Get connection string from environment
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create database connection
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client, { schema })

interface FoodRow {
  dishName: string
  calories: number
  carbohydrates: number
  protein: number
  fats: number
  freeSugar: number
  fibre: number
  sodium: number
  calcium: number
  iron: number
  vitaminC: number
  folate: number
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

async function seedFoodItems() {
  try {
    console.log('🌱 Starting food items seeding...')

    // Read the CSV file
    const csvPath = path.join(__dirname, 'Food.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())

    console.log(`📄 Found ${lines.length - 1} food items in CSV`)

    // Skip header row
    const dataLines = lines.slice(1)

    // Parse and prepare data
    const foodItems: FoodRow[] = []

    for (const line of dataLines) {
      const columns = parseCSVLine(line)

      if (columns.length < 12) {
        console.warn(`⚠️  Skipping invalid line: ${line.substring(0, 50)}...`)
        continue
      }

      const [
        dishName,
        calories,
        carbohydrates,
        protein,
        fats,
        freeSugar,
        fibre,
        sodium,
        calcium,
        iron,
        vitaminC,
        folate,
      ] = columns

      // Skip if essential fields are missing
      if (!dishName || !calories || !carbohydrates || !protein || !fats) {
        console.warn(`⚠️  Skipping item with missing data: ${dishName || 'Unknown'}`)
        continue
      }

      foodItems.push({
        dishName: dishName.trim(),
        calories: parseFloat(calories) || 0,
        carbohydrates: parseFloat(carbohydrates) || 0,
        protein: parseFloat(protein) || 0,
        fats: parseFloat(fats) || 0,
        freeSugar: parseFloat(freeSugar) || 0,
        fibre: parseFloat(fibre) || 0,
        sodium: parseFloat(sodium) || 0,
        calcium: parseFloat(calcium) || 0,
        iron: parseFloat(iron) || 0,
        vitaminC: parseFloat(vitaminC) || 0,
        folate: parseFloat(folate) || 0,
      })
    }

    console.log(`✅ Parsed ${foodItems.length} valid food items`)

    // Check if table already has data
    const existingCount = await db
      .select({ count: schema.foodItems.id })
      .from(schema.foodItems)
      .then(rows => rows.length)

    if (existingCount > 0) {
      console.log(`⚠️  Food items table already contains ${existingCount} items`)
      console.log('   Clearing existing data before seeding...')
      
      // Delete only non-custom items (isCustom = 0)
      await db
        .delete(schema.foodItems)
        .where(eq(schema.foodItems.isCustom, 0))
      
      console.log('   ✅ Cleared CSV-sourced items')
    }

    // Insert in batches to avoid overwhelming the database
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < foodItems.length; i += batchSize) {
      const batch = foodItems.slice(i, i + batchSize)
      
      await db.insert(schema.foodItems).values(
        batch.map(item => ({
          dishName: item.dishName,
          calories: String(item.calories),
          carbohydrates: String(item.carbohydrates),
          protein: String(item.protein),
          fats: String(item.fats),
          freeSugar: String(item.freeSugar),
          fibre: String(item.fibre),
          sodium: String(item.sodium),
          calcium: String(item.calcium),
          iron: String(item.iron),
          vitaminC: String(item.vitaminC),
          folate: String(item.folate),
          isCustom: 0,
          createdBy: null,
        }))
      )

      inserted += batch.length
      console.log(`   📦 Inserted batch ${Math.floor(i / batchSize) + 1}: ${inserted}/${foodItems.length}`)
    }

    console.log('✅ Food items seeding completed successfully!')
    console.log(`📊 Total items seeded: ${inserted}`)

  } catch (error) {
    console.error('❌ Error seeding food items:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Run the seeding
seedFoodItems()
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

