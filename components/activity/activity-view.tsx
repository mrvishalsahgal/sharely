"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  UserPlus,
  Users,
  Filter,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

interface Activity {
  id: string
  type: "expense" | "payment" | "group_join" | "group_create"
  title: string
  description: string
  amount?: number
  isPositive?: boolean
  user: any
  group?: any
  timestamp: Date
}

const activitiesMock: Activity[] = []

const filters = [
  { id: "all", label: "All" },
  { id: "expenses", label: "Expenses" },
  { id: "payments", label: "Payments" },
  { id: "groups", label: "Groups" },
]

interface ActivityViewProps {
  onBack: () => void
}

import { useState } from "react"

export function ActivityView({ onBack }: ActivityViewProps) {
  const [activeFilter, setActiveFilter] = useState("all")
  const { data: activitiesData, isLoading } = useSWR<any[]>('/api/activity', fetcher)

  const activities = (activitiesData || []).map(a => {
    if (a.type === 'expense') {
      return {
        id: a.id,
        type: 'expense',
        title: a.title,
        description: `Paid by ${a.paidBy.name}`,
        amount: a.amount,
        isPositive: false, // We'll need current user context to determine this properly
        user: a.paidBy,
        timestamp: new Date(a.date),
      }
    } else {
      return {
        id: a.id,
        type: 'payment',
        title: 'Settled up',
        description: `${a.fromUser.name} paid ${a.toUser.name}`,
        amount: a.amount,
        isPositive: true,
        user: a.fromUser,
        timestamp: new Date(a.date),
      }
    }
  }) as Activity[]

  const filteredActivities = activities.filter((activity) => {
    if (activeFilter === "all") return true
    if (activeFilter === "expenses") return activity.type === "expense"
    if (activeFilter === "payments") return activity.type === "payment"
    if (activeFilter === "groups")
      return activity.type === "group_join" || activity.type === "group_create"
    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading activity history...</p>
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

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "expense":
        return Receipt
      case "payment":
        return CreditCard
      case "group_join":
        return UserPlus
      case "group_create":
        return Users
    }
  }

  const getActivityColor = (type: Activity["type"], isPositive?: boolean) => {
    if (type === "payment" || type === "expense") {
      return isPositive ? "text-positive bg-positive/20" : "text-negative bg-negative/20"
    }
    return "text-primary bg-primary/20"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Activity</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Filters */}
        <div className="sticky top-[65px] z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="p-4 space-y-3">
          {filteredActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type, activity.isPositive)

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <div className="flex gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium truncate">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      {activity.amount && (
                        <div
                          className={`flex items-center gap-1 font-semibold ${
                            activity.isPositive ? "text-positive" : "text-negative"
                          }`}
                        >
                          {activity.isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          ${(activity.amount ?? 0).toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {activity.group && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {activity.group.emoji} {activity.group.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
