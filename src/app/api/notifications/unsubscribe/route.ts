import { NextResponse } from 'next/server'
import { db, notificationSettings } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user')

  if (!userId) {
    return NextResponse.json({ error: 'Missing user' }, { status: 400 })
  }

  await db.update(notificationSettings)
    .set({ emailEnabled: 0, updatedAt: new Date() })
    .where(eq(notificationSettings.userId, userId))

  return new NextResponse(`You have been unsubscribed from CalorEase reminders.`, {
    status: 200,
    headers: { 'content-type': 'text/plain' },
  })
}


