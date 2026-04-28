'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Receipt, Crown, Heart } from 'lucide-react'
import { weeklyStats } from '@/lib/mock-data'

export function WeeklySummary() {
  const stats = [
    {
      label: 'Total Spent',
      value: `$${weeklyStats.totalSpent.toFixed(2)}`,
      icon: Receipt,
      color: 'text-chart-1'
    },
    {
      label: 'You\'re Owed',
      value: `$${weeklyStats.totalOwed.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-positive'
    },
    {
      label: 'You Owe',
      value: `$${weeklyStats.totalOwing.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-negative',
      rotate: true
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-lg">Your Week in Review</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`inline-flex p-2 rounded-xl bg-secondary mb-2 ${stat.color}`}>
              <stat.icon className={`w-5 h-5 ${stat.rotate ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Fun insights */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
        >
          <Crown className="w-5 h-5 text-chart-4" />
          <div>
            <p className="text-sm font-medium">Biggest Spender</p>
            <p className="text-xs text-muted-foreground">{weeklyStats.biggestSpender.name} dropped ${(weeklyStats.totalSpent * 0.4).toFixed(2)}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
        >
          <Heart className="w-5 h-5 text-negative" />
          <div>
            <p className="text-sm font-medium">Most Generous</p>
            <p className="text-xs text-muted-foreground">{weeklyStats.mostGenerous.name} covered {weeklyStats.expenseCount - 3} expenses</p>
          </div>
        </motion.div>
      </div>

      {/* Progress to settlement */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Settlement Progress</span>
          <span className="text-sm font-medium">{Math.round((weeklyStats.settledCount / weeklyStats.expenseCount) * 100)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(weeklyStats.settledCount / weeklyStats.expenseCount) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-positive to-accent rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}
