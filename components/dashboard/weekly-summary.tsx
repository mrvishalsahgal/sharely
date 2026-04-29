import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Receipt, Crown, Heart, Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

export function WeeklySummary() {
  const { data: stats, isLoading, error } = useSWR('/api/users/me/weekly-summary', fetcher)

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Calculating your weekly stats...</p>
      </div>
    )
  }

  if (error || !stats) return null

  const displayStats = [
    {
      label: 'Total Spent',
      value: `$${(stats.totalSpent ?? 0).toFixed(2)}`,
      icon: Receipt,
      color: 'text-chart-1'
    },
    {
      label: 'You\'re Owed',
      value: `$${(stats.totalOwed ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-positive'
    },
    {
      label: 'You Owe',
      value: `$${(stats.totalOwing ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-negative',
      rotate: true
    },
  ]

  const settlementProgress = stats.expenseCount > 0 
    ? Math.round((stats.settledCount / stats.expenseCount) * 100) 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden shadow-lg border-primary/10"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-lg">Your Week in Review</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`inline-flex p-2 rounded-xl bg-secondary/50 mb-2 ${stat.color}`}>
              <stat.icon className={`w-5 h-5 ${stat.rotate ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-xl font-bold truncate px-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Fun insights */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30"
        >
          <Crown className="w-5 h-5 text-chart-4" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Biggest Spender</p>
            <p className="text-xs text-muted-foreground truncate">
              {stats.biggestSpender?.name || 'You'} dropped ${ (stats.biggestSpender?.amount || 0).toFixed(2) }
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30"
        >
          <Heart className="w-5 h-5 text-negative" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Most Generous</p>
            <p className="text-xs text-muted-foreground truncate">
              {stats.mostGenerous?.name || 'None'} covered {stats.mostGenerous?.count || 0} expenses
            </p>
          </div>
        </motion.div>
      </div>

      {/* Progress to settlement */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Settlement Progress</span>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-xs text-muted-foreground">{stats.settledCount}/{stats.expenseCount} done</span>
          </div>
          <span className="text-sm font-bold text-primary">{settlementProgress}%</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${settlementProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-positive via-accent to-primary rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
          />
        </div>
      </div>
    </motion.div>
  )
}
