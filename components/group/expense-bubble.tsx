'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import type { Expense, User } from '@/lib/mock-data'
import { currentUser } from '@/lib/mock-data'

interface ExpenseBubbleProps {
  expense: Expense
  index: number
  onReact: (expenseId: string, emoji: string) => void
}

const reactionEmojis = ['👍', '😂', '💸', '😋', '🔥']

export function ExpenseBubble({ expense, index, onReact }: ExpenseBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  
  const isPaidByMe = expense.paidBy.id === currentUser.id
  const myShare = expense.splitWith.find(s => s.user.id === currentUser.id)
  
  const timeAgo = getTimeAgo(expense.timestamp)
  
  const payerInitials = expense.paidBy.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`flex gap-3 ${isPaidByMe ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${expense.paidBy.color} text-primary-foreground`}>
        {payerInitials}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[80%] ${isPaidByMe ? 'items-end' : 'items-start'}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          onDoubleClick={() => setShowReactions(true)}
          className={`glass-card rounded-2xl p-4 cursor-pointer ${
            isPaidByMe 
              ? 'rounded-tr-md bg-primary/10' 
              : 'rounded-tl-md'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{expense.emoji}</span>
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.paidBy.name} paid • {timeAgo}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">${expense.amount.toFixed(2)}</p>
              {myShare && !isPaidByMe && (
                <p className={`text-xs ${myShare.settled ? 'text-positive' : 'text-negative'}`}>
                  {myShare.settled ? 'Paid' : `You owe $${myShare.amount.toFixed(2)}`}
                </p>
              )}
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
            <span>Split {expense.splitWith.length + 1} ways</span>
          </button>

          {/* Split breakdown */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                  {/* Payer */}
                  <SplitRow
                    user={expense.paidBy}
                    amount={expense.amount / (expense.splitWith.length + 1)}
                    isPayer
                    settled
                  />
                  {/* Others */}
                  {expense.splitWith.map(split => (
                    <SplitRow
                      key={split.user.id}
                      user={split.user}
                      amount={split.amount}
                      settled={split.settled}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reactions */}
          {expense.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {expense.reactions.map((reaction, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact(expense.id, reaction.emoji)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/80 text-sm hover:bg-secondary transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-xs text-muted-foreground">{reaction.users.length}</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="flex gap-1 mt-2 p-2 glass-card rounded-full"
            >
              {reactionEmojis.map(emoji => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onReact(expense.id, emoji)
                    setShowReactions(false)
                  }}
                  className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center text-xl transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function SplitRow({ 
  user, 
  amount, 
  isPayer = false, 
  settled 
}: { 
  user: User
  amount: number
  isPayer?: boolean
  settled: boolean
}) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${user.color} text-primary-foreground`}>
          {initials}
        </div>
        <span className="text-sm">{user.name}</span>
        {isPayer && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-positive/20 text-positive">
            paid
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${settled ? 'text-positive' : 'text-muted-foreground'}`}>
          ${amount.toFixed(2)}
        </span>
        {settled && !isPayer && (
          <Check className="w-4 h-4 text-positive" />
        )}
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
