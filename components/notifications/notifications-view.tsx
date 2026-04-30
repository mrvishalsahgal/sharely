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
    <div className="min-h-screen bg-background flex flex-col md:pb-8">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="md:hidden sticky top-0 z-50 glass-card border-b border-border/50">
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

      {/* Desktop Header - Visible only on Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
              <p className="text-sm text-muted-foreground font-medium">Stay updated with your group expenses and friend activities.</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="rounded-2xl px-6 py-6 font-bold gap-2 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
            >
              <CheckCheck className="w-5 h-5" />
              Mark all as read
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-lg md:max-w-7xl mx-auto w-full p-4 md:px-8 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Main List */}
          <div className="md:col-span-8 space-y-4">
            {notificationList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 glass-card rounded-[2.5rem] border-dashed border-2"
              >
                <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">You're all caught up!</h2>
                <p className="text-muted-foreground font-medium mt-2">
                  No new notifications to show right now.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
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
                      className={`group rounded-3xl p-5 border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl ${
                        notification.read
                          ? "bg-card/50 border-border opacity-70 grayscale-[0.5]"
                          : "bg-card border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5"
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="relative shrink-0">
                          <div
                            className={`w-14 h-14 rounded-2xl ${notification.user.color || 'bg-primary'} flex items-center justify-center text-white font-black text-xl shadow-lg`}
                          >
                            {notification.user.name.charAt(0)}
                          </div>
                          <div
                            className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-md border-2 border-background ${colorClass}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3
                              className={`font-black text-lg truncate ${
                                !notification.read ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full uppercase tracking-widest">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        <div className="hidden md:flex p-2 rounded-xl group-hover:bg-secondary transition-colors text-muted-foreground/0 group-hover:text-muted-foreground">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Notification Summary (Desktop Only) */}
          <div className="hidden md:block md:col-span-4 space-y-6">
            <div className="glass-card rounded-[2rem] p-8 border border-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
              <h3 className="text-xl font-black mb-6">Summary</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Unread</span>
                  <span className="text-2xl font-black text-primary">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black">{notificationList.length}</span>
                </div>
                
                <div className="pt-6 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    Tip: Keeping your notifications cleared helps you stay on top of your shared expenses and settlements.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
