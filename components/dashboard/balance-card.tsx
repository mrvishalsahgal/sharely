'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import type { Balance } from '@/lib/types'

interface BalanceCardProps {
  balance: Balance
  index: number
  onSettle?: (balance: Balance) => void
}

export function BalanceCard({ balance, index, onSettle }: BalanceCardProps) {
  const { user, amount } = balance
  const isOwed = amount > 0
  const isSettled = amount === 0
  
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card rounded-2xl p-4 cursor-pointer transition-all ${
        !isSettled && (isOwed ? 'hover:shadow-[0_0_30px_var(--glow-positive)]' : 'hover:shadow-[0_0_30px_var(--glow-negative)]')
      }`}
      onClick={() => !isSettled && onSettle?.(balance)}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${user.color || 'bg-primary'} text-primary-foreground`}>
          {initials}
          {/* Live indicator */}
          {!isSettled && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                isOwed ? 'bg-positive' : 'bg-negative'
              }`}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground">
            {isSettled 
              ? 'All settled' 
              : isOwed 
                ? 'owes you' 
                : 'you owe'}
          </p>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2">
          {!isSettled && (
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: isOwed ? 45 : -45 }}
              className={isOwed ? 'text-positive' : 'text-negative'}
            >
              {isOwed ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </motion.div>
          )}
          <span className={`text-xl font-bold ${
            isSettled 
              ? 'text-muted-foreground' 
              : isOwed 
                ? 'text-positive' 
                : 'text-negative'
          }`}>
            ${Math.abs(amount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quick settle button */}
      {!isSettled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          whileHover={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <div className="pt-3 mt-3 border-t border-border/50">
            <button className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
              isOwed 
                ? 'bg-positive/20 text-positive hover:bg-positive/30' 
                : 'bg-negative/20 text-negative hover:bg-negative/30'
            }`}>
              {isOwed ? 'Remind' : 'Settle Up'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
