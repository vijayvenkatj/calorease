import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// For edge runtime compatibility, we'll use the Supabase connection string
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the postgres client
const client = postgres(connectionString, {
  prepare: false, // For compatibility with serverless environments
})

// Create the drizzle instance
export const db = drizzle(client, { schema })

export * from './schema'
