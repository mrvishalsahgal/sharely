"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Receipt,
  CreditCard,
  AlertCircle,
  UserPlus,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

interface Notification {
  id: string
  type: "expense_added" | "settled_up" | "payment_received" | "payment_reminder" | "friend_request" | "group_invite" | "reminder"
  title: string
  message: string
  read: boolean
  user: any
  timestamp: Date
  actionUrl?: string
}

interface NotificationsViewProps {
  onBack: () => void
}

export function NotificationsView({ onBack }: NotificationsViewProps) {
  const { data: notificationsData, mutate, isLoading } = useSWR<any[]>('/api/notifications', fetcher)

  const notificationList = (notificationsData || []).map(n => ({
    id: n._id,
    type: n.type as any,
    title: n.type === 'expense_added' ? 'New expense added' : 
           n.type === 'reminder' ? 'Payment reminder' :
           n.type === 'settled_up' ? 'Payment received' : 
           'New notification',
    message: n.message,
    read: n.isRead,
    user: n.fromUser || { name: 'System', color: 'bg-primary' },
    timestamp: new Date(n.createdAt),
  }))

  const unreadCount = notificationList.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      })
      mutate()
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      mutate()
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading notifications...</p>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "expense_added":
        return Receipt
      case "payment_received":
        return CreditCard
      case "payment_reminder":
        return AlertCircle
      case "friend_request":
        return UserPlus
      case "group_invite":
        return UserPlus
      case "settled_up":
        return CreditCard
      case "reminder":
        return AlertCircle
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "expense_added":
        return "text-chart-2 bg-chart-2/20"
      case "payment_received":
        return "text-positive bg-positive/20"
      case "payment_reminder":
        return "text-negative bg-negative/20"
      case "friend_request":
      case "group_invite":
        return "text-primary bg-primary/20"
      case "settled_up":
        return "text-positive bg-positive/20"
      case "reminder":
        return "text-negative bg-negative/20"
      default:
        return "text-muted-foreground bg-muted/20"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-lg w-full mx-auto p-4">
        {notificationList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-muted-foreground">
              No new notifications at the moment
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {notificationList.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type) || Bell
              const colorClass = getNotificationColor(notification.type)

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`bg-card rounded-2xl p-4 border cursor-pointer transition-all ${
                    notification.read
                      ? "border-border opacity-70"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full ${notification.user.color} flex items-center justify-center text-white font-medium`}
                      >
                        {notification.user.name.charAt(0)}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-medium ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-2 inline-block">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
