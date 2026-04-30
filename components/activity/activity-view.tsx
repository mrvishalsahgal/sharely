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
  Activity as ActivityIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

interface Activity {
  id: string
  type: "expense" | "payment" | "settlement" | "group_join" | "group_create"
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
  const [page, setPage] = useState(1)
  const [activities, setActivities] = useState<Activity[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { isLoading } = useSWR(`/api/activity?page=${page}&limit=10`, fetcher, {
    onSuccess: (newData) => {
      if (newData.length < 10) setHasMore(false)
      
      const formatted = newData.map((a: any) => {
        if (a.type === 'expense') {
          return {
            id: a.id,
            type: 'expense',
            title: a.title,
            description: `Paid by ${a.paidBy.name}`,
            amount: a.amount,
            isPositive: false,
            user: a.paidBy,
            timestamp: new Date(a.date),
          }
        } else {
          return {
            id: a.id,
            type: 'settlement',
            title: 'Settled up',
            description: `${a.fromUser.name} paid ${a.toUser.name}`,
            amount: a.amount,
            isPositive: true,
            user: a.fromUser,
            timestamp: new Date(a.date),
          }
        }
      })

      // Only append if it's a new page
      setActivities(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNew = formatted.filter((f: any) => !existingIds.has(f.id))
        return [...prev, ...uniqueNew]
      })
      setIsLoadingMore(false)
    }
  })

  const loadMore = () => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    setPage(prev => prev + 1)
  }

  const filteredActivities = activities.filter((activity) => {
    if (activeFilter === "all") return true
    if (activeFilter === "expenses") return activity.type === "expense"
    if (activeFilter === "payments") return activity.type === "payment" || activity.type === "settlement"
    if (activeFilter === "groups")
      return activity.type === "group_join" || activity.type === "group_create"
    return true
  })

  if (isLoading && activities.length === 0) {
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
      case "settlement":
        return CreditCard
      case "group_join":
        return UserPlus
      case "group_create":
        return Users
    }
  }

  const getActivityColor = (type: Activity["type"], isPositive?: boolean) => {
    if (type === "payment" || type === "settlement" || type === "expense") {
      return isPositive ? "text-positive bg-positive/20" : "text-negative bg-negative/20"
    }
    return "text-primary bg-primary/20"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:pb-8">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="md:hidden sticky top-0 z-50 glass-card border-b border-border/50">
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

      {/* Desktop Header - Visible only on Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <ActivityIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Recent Activity</h1>
              <p className="text-sm text-muted-foreground font-medium">Tracking every transaction and group update in real-time.</p>
            </div>
          </div>
          <div className="flex gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-border/50">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg md:max-w-7xl mx-auto w-full p-0 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Main Activity Feed */}
          <div className="md:col-span-8 space-y-4">
            {/* Mobile Filters (Hidden on Desktop) */}
            <div className="md:hidden sticky top-[65px] z-40 bg-background/80 backdrop-blur-xl border-b border-border">
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

            {/* List */}
            <div className="p-4 md:p-0 space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-[2.5rem] border-dashed border-2">
                  <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-6">
                    <Filter className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold">No activities found</h3>
                  <p className="text-muted-foreground mt-2 font-medium">Try changing your filters or add some expenses.</p>
                </div>
              ) : (
                filteredActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type)
                  const colorClass = getActivityColor(activity.type, activity.isPositive)

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-card rounded-3xl p-5 border border-border/50 hover:border-primary/20 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <div className="flex gap-5 items-center">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${colorClass}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{activity.title}</h3>
                              <p className="text-muted-foreground font-medium">
                                {activity.description}
                              </p>
                            </div>
                            {activity.amount && (
                              <div
                                className={`flex flex-col items-end gap-1 font-black text-lg ${
                                  activity.isPositive ? "text-positive" : "text-negative"
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {activity.isPositive ? (
                                    <TrendingUp className="w-5 h-5" />
                                  ) : (
                                    <TrendingDown className="w-5 h-5" />
                                  )}
                                  ${(activity.amount ?? 0).toFixed(2)}
                                </div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                  Amount
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            {activity.group && (
                              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border/50">
                                {activity.group.emoji} {activity.group.name}
                              </span>
                            )}
                            <span className="text-xs font-bold text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
                              {formatTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}

              {hasMore && (
                <div className="pt-8 pb-12 flex justify-center">
                  <Button 
                    onClick={loadMore} 
                    disabled={isLoadingMore}
                    variant="outline"
                    className="rounded-2xl px-12 py-6 font-black text-lg glass-card hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/5"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Activity"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Activity Stats (Desktop Only) */}
          <div className="hidden md:block md:col-span-4 space-y-6 sticky top-32">
            <div className="glass-card rounded-[2.5rem] p-8 border border-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
              <h3 className="text-xl font-black mb-6">Activity Trends</h3>
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Total Activity</p>
                  <p className="text-3xl font-black">{activities.length}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-negative/5 border border-negative/10">
                    <p className="text-[10px] font-bold text-negative/60 uppercase tracking-wider mb-1">Expenses</p>
                    <p className="text-xl font-black text-negative">
                      {activities.filter(a => a.type === 'expense').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-positive/5 border border-positive/10">
                    <p className="text-[10px] font-bold text-positive/60 uppercase tracking-wider mb-1">Payments</p>
                    <p className="text-xl font-black text-positive">
                      {activities.filter(a => a.type === 'payment').length}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <p className="text-xs font-bold text-primary leading-tight">
                      Your activity has increased by 12% this week compared to last week.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Card */}
            <div className="glass-card rounded-[2rem] p-6 bg-gradient-to-br from-secondary/50 to-background border border-border/30">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Export History</h4>
              <Button variant="outline" className="w-full rounded-2xl font-bold py-6 hover:bg-primary hover:text-white transition-all">
                Download as CSV
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
