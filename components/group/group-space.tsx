'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Users, Settings, PieChart, MoreHorizontal, Edit2, BellOff, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ExpenseBubble } from './expense-bubble'
import type { Group, Expense } from '@/lib/mock-data'
import { expenses as allExpenses } from '@/lib/mock-data'

interface GroupSpaceProps {
  group: Group
  onBack: () => void
  onAddExpense: () => void
  onAddMembers: () => void
}

export function GroupSpace({ group, onBack, onAddExpense, onAddMembers }: GroupSpaceProps) {
  const [expenses, setExpenses] = useState<Expense[]>(allExpenses)
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'stats'>('expenses')

  const handleReact = (expenseId: string, emoji: string) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp
      
      const existingReaction = exp.reactions.find(r => r.emoji === emoji)
      if (existingReaction) {
        return {
          ...exp,
          reactions: exp.reactions.filter(r => r.emoji !== emoji)
        }
      }
      
      return {
        ...exp,
        reactions: [...exp.reactions, { emoji, users: [] }]
      }
    }))
  }

  const isPositive = group.yourBalance > 0
  const isNegative = group.yourBalance < 0

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
                  <p className="text-xs text-muted-foreground">{group.members.length} members</p>
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
                  <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg p-2 hover:bg-negative/20 text-negative focus:text-negative focus:bg-negative/20">
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
              group.yourBalance === 0
                ? 'bg-secondary'
                : isPositive
                  ? 'bg-positive/10'
                  : 'bg-negative/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your balance in this group</span>
              <span className={`text-lg font-bold ${
                group.yourBalance === 0
                  ? 'text-muted-foreground'
                  : isPositive
                    ? 'text-positive'
                    : 'text-negative'
              }`}>
                {isPositive && '+'}
                {isNegative && '-'}
                ${Math.abs(group.yourBalance).toFixed(2)}
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
              {/* Date separator */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">Today</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {expenses.slice(0, 2).map((expense, index) => (
                <ExpenseBubble
                  key={expense.id}
                  expense={expense}
                  index={index}
                  onReact={handleReact}
                />
              ))}

              {/* Date separator */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">Yesterday</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {expenses.slice(2, 4).map((expense, index) => (
                <ExpenseBubble
                  key={expense.id}
                  expense={expense}
                  index={index + 2}
                  onReact={handleReact}
                />
              ))}

              {/* Date separator */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">Earlier this week</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {expenses.slice(4).map((expense, index) => (
                <ExpenseBubble
                  key={expense.id}
                  expense={expense}
                  index={index + 4}
                  onReact={handleReact}
                />
              ))}
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
    </div>
  )
}

function GroupBalances({ group }: { group: Group }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Who owes whom</h3>
      {group.members.slice(1).map((member, index) => {
        const owes = (Math.random() - 0.5) * 100
        const initials = member.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()

        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${member.color} text-primary-foreground`}>
                  {initials}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {owes > 0 ? 'owes you' : 'you owe'}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${owes > 0 ? 'text-positive' : 'text-negative'}`}>
                ${Math.abs(owes).toFixed(2)}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function GroupStats({ group }: { group: Group }) {
  const categories = [
    { name: 'Food & Drinks', amount: 450, color: 'bg-chart-1', percent: 40 },
    { name: 'Utilities', amount: 280, color: 'bg-chart-2', percent: 25 },
    { name: 'Entertainment', amount: 180, color: 'bg-chart-3', percent: 16 },
    { name: 'Transport', amount: 120, color: 'bg-chart-4', percent: 11 },
    { name: 'Other', amount: 90, color: 'bg-chart-5', percent: 8 },
  ]

  return (
    <div className="space-y-6">
      {/* Total spent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6 text-center"
      >
        <p className="text-sm text-muted-foreground mb-2">Total Group Spending</p>
        <p className="text-4xl font-bold">${group.totalExpenses.toLocaleString()}</p>
      </motion.div>

      {/* Category breakdown */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Spending by Category</h3>
        </div>
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{cat.name}</span>
                <span className="text-sm font-medium">${cat.amount}</span>
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
      </div>

      {/* Fun stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-4 text-center"
        >
          <p className="text-3xl font-bold text-chart-1">12</p>
          <p className="text-xs text-muted-foreground">Total Expenses</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl p-4 text-center"
        >
          <p className="text-3xl font-bold text-positive">8</p>
          <p className="text-xs text-muted-foreground">Settled</p>
        </motion.div>
      </div>
    </div>
  )
}
