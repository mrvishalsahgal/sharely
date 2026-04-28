'use client'

import { motion } from 'framer-motion'
import { Users, ChevronRight } from 'lucide-react'
import type { Group } from '@/lib/types'

interface GroupCardProps {
  group: Group & { yourBalance?: number }
  index: number
  onClick?: (group: Group) => void
}

export function GroupCard({ group, index, onClick }: GroupCardProps) {
  const balance = group.userBalance ?? group.yourBalance ?? 0
  const isPositive = balance > 0
  const isNegative = balance < 0
  const isSettled = balance === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(group)}
      className="glass-card rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className={`absolute inset-0 bg-gradient-to-br ${
          isPositive 
            ? 'from-positive/10 to-transparent' 
            : isNegative 
              ? 'from-negative/10 to-transparent'
              : 'from-neutral/10 to-transparent'
        }`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
              {group.emoji}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Users className="w-4 h-4" />
                <span>{group.members.length} members</span>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            className="text-muted-foreground group-hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Balance</p>
            <p className={`text-xl font-bold ${
              isSettled 
                ? 'text-muted-foreground' 
                : isPositive 
                  ? 'text-positive' 
                  : 'text-negative'
            }`}>
              {isPositive && '+'}
              {isNegative && '-'}
              ${Math.abs(balance).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Spent</p>
            <p className="text-xl font-bold">${(group.totalExpenses || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Member avatars */}
        <div className="flex items-center mt-4 -space-x-2">
          {group.members.slice(0, 4).map((member, i) => {
            const initials = member.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
            return (
              <motion.div
                key={member._id || member.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${member.color || 'bg-primary'} text-primary-foreground border-2 border-background`}
              >
                {initials}
              </motion.div>
            )
          })}
          {group.members.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium border-2 border-background">
              +{group.members.length - 4}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
