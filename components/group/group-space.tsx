'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Users, Settings, PieChart, MoreHorizontal, Edit2, BellOff, LogOut, Loader2, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import useSWR, { useSWRConfig } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { ExpenseBubble } from './expense-bubble'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import type { Group, Expense, Balance } from '@/lib/types'

interface GroupSpaceProps {
  group: Group
  onBack: () => void
  onAddExpense: () => void
  onAddMembers: () => void
}

export function GroupSpace({ group, onBack, onAddExpense, onAddMembers }: GroupSpaceProps) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'stats'>('expenses')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const { data: expensesData, isLoading: expensesLoading } = useSWR<any[]>(`/api/groups/${group.id}/expenses`, fetcher)
  const { data: groupBalancesData, isLoading: balancesLoading } = useSWR<Balance[]>(`/api/groups/${group.id}/balances`, fetcher)

  const expenses = (expensesData || []).map(e => ({
    id: e._id,
    title: e.title,
    amount: e.amount,
    paidBy: e.paidBy,
    splits: e.splits.map((s: any) => ({
      user: s.user,
      amountOwed: s.amountOwed,
      hasSettled: s.hasSettled
    })),
    category: e.category.toLowerCase(),
    date: e.createdAt,
    reactions: (e.reactions || []).reduce((acc: any[], curr: any) => {
      const existing = acc.find(r => r.emoji === curr.emoji)
      if (existing) {
        existing.users.push(curr.user)
      } else {
        acc.push({ emoji: curr.emoji, users: [curr.user] })
      }
      return acc
    }, [])
  })) as any[] 

  const { mutate } = useSWRConfig()

  const handleReact = async (expenseId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      if (response.ok) {
        mutate(`/api/groups/${group.id}/expenses`)
      }
    } catch (error) {
      console.error('Reaction error:', error)
    }
  }

  const isPositive = (group.userBalance || 0) > 0
  const isNegative = (group.userBalance || 0) < 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">
                  {group.emoji}
                </div>
                <div>
                  <h1 className="font-semibold">{group.name}</h1>
                  <button 
                    onClick={onAddMembers}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {group.members?.length || 0} members
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={onAddMembers}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Users className="w-5 h-5" />
              </motion.button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-border bg-card shadow-xl">
                  <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg p-2 hover:bg-secondary">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                    <span>Edit Group</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg p-2 hover:bg-secondary">
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                    <span>Mute Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowLeaveConfirm(true)}
                    className="gap-2 cursor-pointer rounded-lg p-2 hover:bg-negative/20 text-negative focus:text-negative focus:bg-negative/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Leave Group</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Balance summary */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl ${
              (group.userBalance || 0) === 0
                ? 'bg-secondary'
                : isPositive
                  ? 'bg-positive/10'
                  : 'bg-negative/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your balance in this group</span>
              <span className={`text-lg font-bold ${
                (group.userBalance || 0) === 0
                  ? 'text-muted-foreground'
                  : isPositive
                    ? 'text-positive'
                    : 'text-negative'
              }`}>
                {isPositive && '+'}
                {isNegative && '-'}
                ${Math.abs(group.userBalance ?? 0).toFixed(2)}
              </span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {(['expenses', 'balances', 'stats'] as const).map(tab => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
                  {expenses.map((expense, index) => (
                    <ExpenseBubble
                      key={expense.id}
                      expense={expense}
                      index={index}
                      onReact={handleReact}
                    />
                  ))}

                  {expenses.length === 0 && !expensesLoading && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No expenses yet. Add one to get started!</p>
                    </div>
                  )}
            </motion.div>
          )}

          {activeTab === 'balances' && (
            <motion.div
              key="balances"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <GroupBalances group={group} />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <GroupStats group={group} />
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Confirm Leave Modal */}
      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={async () => {
          setIsLeaving(true)
          try {
            const response = await fetch(`/api/groups/${group.id}/leave`, { method: 'POST' })
            if (response.ok) {
              mutate('/api/groups')
              onBack()
            }
          } catch (error) {
            console.error('Leave group error:', error)
          } finally {
            setIsLeaving(false)
            setShowLeaveConfirm(false)
          }
        }}
        title="Leave Group?"
        message={`Are you sure you want to leave ${group.name}? You will no longer be able to see expenses or balances.`}
        confirmText="Leave Group"
        variant="danger"
        isLoading={isLeaving}
      />
    </div>
  )
}

function GroupBalances({ group }: { group: Group }) {
  const { data: balances, isLoading } = useSWR<Balance[]>(`/api/groups/${group.id}/balances`, fetcher)

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Everyone is settled up!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Who owes whom</h3>
      {balances.map((balance, index) => {
        const owes = balance.amount
        const initials = (balance.user?.name || '?')
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()

        return (
          <motion.div
            key={balance.user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${balance.user.color || 'bg-primary'} text-primary-foreground`}>
                  {initials}
                </div>
                <div>
                  <p className="font-medium">{balance.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    {owes > 0 ? 'owes you' : 'you owe'}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${owes > 0 ? 'text-positive' : 'text-negative'}`}>
                ${Math.abs(owes ?? 0).toFixed(2)}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function GroupStats({ group }: { group: Group }) {
  const { data: statsData, isLoading } = useSWR<{ totalSpent: number; categories: any[] }>(
    `/api/groups/${group.id}/stats`, 
    fetcher
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const stats = statsData || { totalSpent: 0, categories: [] }

  return (
    <div className="space-y-6">
      {/* Total spent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6 text-center"
      >
        <p className="text-sm text-muted-foreground mb-2">Total Group Spending</p>
        <p className="text-4xl font-bold">${(stats.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </motion.div>

      {/* Category breakdown */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Spending by Category</h3>
        </div>
        {(stats.categories?.length || 0) > 0 ? (
          <div className="space-y-3">
            {stats.categories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{cat.name}</span>
                  <span className="text-sm font-medium">${cat.amount.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percent}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-sm text-muted-foreground">No expenses yet</p>
        )}
      </div>
    </div>
  )
}
