import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// For edge runtime compatibility, we'll use the Supabase connection string
const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', 'postgresql://postgres:') + ':5432/postgres'

if (!connectionString) {
  throw new Error('Database connection string not found')
}

// Create the postgres client
const client = postgres(connectionString, {
  prepare: false, // For compatibility with serverless environments
})

// Create the drizzle instance
export const db = drizzle(client, { schema })

export * from './schema'
