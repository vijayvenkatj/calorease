'use client'

import { useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/utils/trpc'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const utils = trpc.useUtils()

  const { data: notifications = [], isLoading } = trpc.notifications.getMyNotifications.useQuery(
    { limit: 10, unreadOnly: false },
    { enabled: isOpen } // Only fetch when open
  )

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getMyNotifications.invalidate()
    },
  })

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getMyNotifications.invalidate()
    },
  })

  const unreadCount = notifications.filter((n) => n.isRead === 0).length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification panel */}
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96">
            <Card className="shadow-lg border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllAsRead.mutate()}
                        disabled={markAllAsRead.isPending}
                        className="text-xs h-7"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <CardDescription>{unreadCount} unread</CardDescription>
                )}
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        notif.isRead === 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-secondary/50 border-border'
                      }`}
                      onClick={() => {
                        if (notif.isRead === 0) {
                          markAsRead.mutate({ notificationId: notif.id })
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium truncate">
                              {notif.title}
                            </h4>
                            {notif.isRead === 0 && (
                              <div className="h-2 w-2 bg-emerald-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

