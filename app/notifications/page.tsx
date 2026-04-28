"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Receipt,
  CreditCard,
  UserPlus,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { users } from "@/lib/mock-data"

interface Notification {
  id: string
  type: "expense_added" | "payment_received" | "payment_reminder" | "friend_request" | "group_invite"
  title: string
  message: string
  read: boolean
  user: any
  timestamp: Date
  actionUrl?: string
}

const notifications: Notification[] = []

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)

  const unreadCount = notificationList.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
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
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
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

      <main className="max-w-2xl mx-auto p-4">
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
              const Icon = getNotificationIcon(notification.type)
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
