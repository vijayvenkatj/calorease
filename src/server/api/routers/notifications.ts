import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import { and, eq, desc } from 'drizzle-orm'
import { db, notificationSettings, profiles, inAppNotifications } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'
import { getResendClient } from '@/utils/resend'

const t = initTRPC.create()

export const notificationsRouter = t.router({
  getMySettings: t.procedure.query(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Must be logged in' })
    }
    const settings = await db.query.notificationSettings.findFirst({
      where: (ns, { eq }) => eq(ns.userId, user.id),
    })
    return settings || null
  }),

  upsertMySettings: t.procedure
    .input(z.object({
      emailEnabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly']).default('daily'),
    }))
    .mutation(async ({ input }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Must be logged in' })
      }

      const existing = await db.query.notificationSettings.findFirst({
        where: (ns, { eq }) => eq(ns.userId, user.id),
      })

      if (existing) {
        const [updated] = await db.update(notificationSettings)
          .set({
            emailEnabled: input.emailEnabled ? 1 : 0,
            frequency: input.frequency,
            updatedAt: new Date(),
          })
          .where(eq(notificationSettings.userId, user.id))
          .returning()
        return updated
      }

      const [inserted] = await db.insert(notificationSettings).values({
        userId: user.id,
        emailEnabled: input.emailEnabled ? 1 : 0,
        frequency: input.frequency,
      }).returning()
      return inserted
    }),

  sendReminderNow: t.procedure
    .input(z.object({ type: z.enum(['food', 'water']) }))
    .mutation(async ({ input }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Must be logged in' })
      }

      const settings = await db.query.notificationSettings.findFirst({
        where: (ns, { eq }) => eq(ns.userId, user.id),
      })
      if (!settings || settings.emailEnabled !== 1) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email notifications disabled' })
      }

      const profile = await db.query.profiles.findFirst({
        where: (p, { eq }) => eq(p.id, user.id),
      })

      const resend = getResendClient()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      const unsubscribeUrl = `${appUrl}/api/notifications/unsubscribe?user=${user.id}`

      const subject = input.type === 'food' ? 'Time to log your meals' : 'Remember your water intake'
      const ctaHref = input.type === 'food' ? `${appUrl}/dashboard` : `${appUrl}/dashboard`

      await resend.emails.send({
        from: process.env.RESEND_FROM || 'CalorEase <noreply@calorease.dev>',
        to: user.email!,
        subject,
        html: `
          <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6">
            <h2>Hello ${profile?.name ?? 'there'} 👋</h2>
            <p>This is a gentle reminder to log your ${input.type === 'food' ? 'food' : 'water'} today.</p>
            <p><a href="${ctaHref}" style="display:inline-block;padding:10px 16px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none">Open CalorEase</a></p>
            <p style="font-size:12px;color:#6b7280;margin-top:24px">Don't want these? <a href="${unsubscribeUrl}">Unsubscribe</a></p>
          </div>
        `,
      })

      await db.update(notificationSettings)
        .set({ lastSentAt: new Date(), updatedAt: new Date() })
        .where(eq(notificationSettings.userId, user.id))

      return { ok: true }
    }),

  // Get in-app notifications
  getMyNotifications: t.procedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Must be logged in' })
      }

      const notifications = await db
        .select()
        .from(inAppNotifications)
        .where(
          input.unreadOnly
            ? and(eq(inAppNotifications.userId, user.id), eq(inAppNotifications.isRead, 0))
            : eq(inAppNotifications.userId, user.id)
        )
        .orderBy(desc(inAppNotifications.createdAt))
        .limit(input.limit)

      return notifications
    }),

  // Mark notification as read
  markAsRead: t.procedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Must be logged in' })
      }

      await db
        .update(inAppNotifications)
        .set({ isRead: 1 })
        .where(and(
          eq(inAppNotifications.id, input.notificationId),
          eq(inAppNotifications.userId, user.id)
        ))

      return { ok: true }
    }),

  // Mark all notifications as read
  markAllAsRead: t.procedure.mutation(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Must be logged in' })
    }

    await db
      .update(inAppNotifications)
      .set({ isRead: 1 })
      .where(eq(inAppNotifications.userId, user.id))

    return { ok: true }
  }),
})


