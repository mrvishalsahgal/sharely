'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Bell, Settings, Search, User, Activity, Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { AnimatedBalance } from './animated-balance'
import { BalanceCard } from './balance-card'
import { GroupCard } from './group-card'
import { WeeklySummary } from './weekly-summary'
import type { Balance, Group } from '@/lib/types'

interface DashboardProps {
  onAddExpense: () => void
  onSelectGroup: (group: Group) => void
  onSettle: (balance: Balance) => void
  onOpenSettings: () => void
  onOpenNotifications: () => void
  onCreateGroup: () => void
  onOpenProfile: () => void
  onOpenActivity: () => void
}

export function Dashboard({ 
  onAddExpense, 
  onSelectGroup, 
  onSettle,
  onOpenSettings,
  onOpenNotifications,
  onCreateGroup,
  onOpenProfile,
  onOpenActivity
}: DashboardProps) {
  const [showNotification, setShowNotification] = useState(true)

  const { data: groupsData, error: groupsError, isLoading: groupsLoading } = useSWR<any[]>('/api/groups', fetcher)
  const { data: balancesData, error: balancesError, isLoading: balancesLoading } = useSWR<Balance[]>('/api/users/me/balances', fetcher)
  
  const balances = balancesData || []
  const groups = (groupsData || []).map(g => ({
    id: g._id,
    name: g.name,
    emoji: g.emoji,
    type: g.type || 'home',
    members: g.members,
    totalExpenses: 0,
    userBalance: 0
  })) as Group[]

  const netBalance = balances.reduce((sum, b) => sum + b.amount, 0)
  const activeBalances = balances.filter(b => Math.abs(b.amount) > 0.01)

  if (groupsLoading || balancesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">SplitSmart</h1>
              <p className="text-sm text-muted-foreground">Welcome back!</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={onOpenProfile}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={onOpenActivity}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Activity className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                onClick={() => {
                  setShowNotification(false)
                  onOpenNotifications()
                }}
              >
                <Bell className="w-5 h-5" />
                {showNotification && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-negative rounded-full"
                  />
                )}
              </motion.button>
              <motion.button
                onClick={onOpenSettings}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4">
        {/* Hero Balance */}
        <section className="py-8">
          <AnimatedBalance amount={netBalance} />
        </section>

        {/* Quick Summary Pills */}
        <section className="flex gap-3 mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-positive/20 text-positive text-sm font-medium"
          >
            {activeBalances.filter(b => b.amount > 0).length} owe you
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-negative/20 text-negative text-sm font-medium"
          >
            {activeBalances.filter(b => b.amount < 0).length} you owe
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-sm font-medium"
          >
            {groups.length} groups
          </motion.div>
        </section>

        {/* Balances Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">People</h2>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              See all
            </button>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {activeBalances.slice(0, 3).map((balance, index) => (
                <BalanceCard
                  key={balance.user.id}
                  balance={balance}
                  index={index}
                  onSettle={onSettle}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Groups Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Groups</h2>
            <button onClick={onCreateGroup} className="text-sm text-primary hover:text-primary/80 transition-colors">
              Create group
            </button>
          </div>
          <div className="grid gap-4">
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                index={index}
                onClick={onSelectGroup}
              />
            ))}
          </div>
        </section>

        {/* Weekly Summary */}
        <section className="mb-8">
          <WeeklySummary />
        </section>
      </main>

      {/* Floating Add Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onAddExpense}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-2xl flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </div>
  )
}
