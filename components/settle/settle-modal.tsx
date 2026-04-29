'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Check, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { Balance } from '@/lib/types'

interface SettleModalProps {
  isOpen: boolean
  balance: Balance | null
  onClose: () => void
  onSettle: () => void
}

export function SettleModal({ isOpen, balance, onClose, onSettle }: SettleModalProps) {
  const [isSettling, setIsSettling] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [settleType, setSettleType] = useState<'full' | 'custom'>('full')
  const [customAmount, setCustomAmount] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setIsSettling(false)
      setShowSuccess(false)
      setShowTransfer(false)
      setSettleType('full')
      setCustomAmount('')
    } else if (balance) {
      setCustomAmount(Math.abs(balance.amount).toString())
    }
  }, [isOpen, balance])

  if (!balance) return null

  const isOwed = balance.amount > 0
  const initials = (balance.user?.name || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const handleSettle = async () => {
    setIsSettling(true)
    setShowTransfer(true)

    try {
      const finalAmount = settleType === 'custom' ? parseFloat(customAmount) : Math.abs(balance.amount)
      
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUser: balance.user.id,
          amount: finalAmount,
          method: 'cash',
          isReminder: isOwed,
          // groupId: group.id,
        })
      })

      if (!response.ok) throw new Error('Settlement failed')

      setShowTransfer(false)
      setShowSuccess(true)

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#059669', '#34d399']
      })

      setTimeout(() => {
        onSettle()
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Settlement error:', error)
      setIsSettling(false)
      setShowTransfer(false)
      // Add error feedback here if needed
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {showSuccess ? 'Settled!' : 'Settle Up'}
              </h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <SuccessState amount={settleType === 'custom' ? (isOwed ? parseFloat(customAmount) : -parseFloat(customAmount)) : balance.amount} userName={balance.user?.name || 'Unknown'} />
                ) : showTransfer ? (
                  <TransferAnimation 
                    amount={settleType === 'custom' ? parseFloat(customAmount) : balance.amount} 
                    initials={initials}
                    color={balance.user.color || 'bg-primary'}
                    isOwed={isOwed}
                  />
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Person card */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold ${balance.user.color} text-primary-foreground`}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{balance.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {isOwed ? 'owes you' : 'you owe'}
                        </p>
                      </div>
                    </div>

                    {/* Amount display */}
                    <div className="text-center py-6">
                      <div className="flex justify-center mb-6">
                        <div className="bg-secondary p-1 rounded-xl flex gap-1">
                          <button 
                            onClick={() => {
                              setSettleType('full')
                              setCustomAmount(Math.abs(balance.amount).toString())
                            }} 
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settleType === 'full' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Full Amount
                          </button>
                          <button 
                            onClick={() => setSettleType('custom')} 
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settleType === 'custom' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Custom Amount
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {isOwed ? 'Request' : 'Send'}
                      </p>
                      
                      {settleType === 'full' ? (
                        <p className={`text-5xl font-bold ${isOwed ? 'text-positive' : 'text-negative'}`}>
                          ${Math.abs(balance.amount).toFixed(2)}
                        </p>
                      ) : (
                        <div className="flex items-center justify-center text-5xl font-bold gap-1">
                          <span className={isOwed ? 'text-positive' : 'text-negative'}>$</span>
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            max={Math.abs(balance.amount)}
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                            className={`w-32 bg-transparent border-b-2 border-transparent focus:border-primary/50 focus:outline-none text-center ${isOwed ? 'text-positive' : 'text-negative'}`}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>

                    {/* Payment methods */}
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Pay with</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['Venmo', 'PayPal', 'Cash'].map(method => (
                          <motion.button
                            key={method}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                          >
                            {method}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Action button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSettle}
                      disabled={isSettling}
                      className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
                        isOwed
                          ? 'bg-positive text-positive-foreground'
                          : 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                      {isOwed ? 'Send Reminder' : 'Settle Up Now'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TransferAnimation({ 
  amount, 
  initials, 
  color,
  isOwed 
}: { 
  amount: number
  initials: string
  color: string
  isOwed: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center py-12"
    >
      <div className="relative w-64 h-32 flex items-center justify-center">
        {/* You */}
        <motion.div
          initial={{ x: isOwed ? 80 : -80 }}
          animate={{ x: isOwed ? 80 : -80 }}
          className="absolute w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold"
        >
          You
        </motion.div>

        {/* Them */}
        <motion.div
          initial={{ x: isOwed ? -80 : 80 }}
          animate={{ x: isOwed ? -80 : 80 }}
          className={`absolute w-14 h-14 rounded-full ${color} flex items-center justify-center text-primary-foreground font-semibold`}
        >
          {initials}
        </motion.div>

        {/* Money flowing */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: isOwed ? -60 : 60, 
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              x: isOwed ? 60 : -60, 
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-8 h-8 rounded-full bg-chart-4 flex items-center justify-center text-xs font-bold"
          >
            $
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground mt-8"
      >
        {isOwed ? 'Requesting' : 'Sending'} ${Math.abs(amount).toFixed(2)}...
      </motion.p>
    </motion.div>
  )
}

function SuccessState({ amount, userName }: { amount: number; userName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-positive flex items-center justify-center mb-6"
      >
        <Check className="w-10 h-10 text-positive-foreground" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-chart-4" />
          <h3 className="text-2xl font-bold">All Done!</h3>
          <Sparkles className="w-5 h-5 text-chart-4" />
        </div>
        <p className="text-muted-foreground">
          {amount > 0 
            ? `Reminder sent to ${userName}` 
            : `$${Math.abs(amount).toFixed(2)} settled with ${userName}`
          }
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-2xl mt-6"
      >
        No debts, just vibes
      </motion.p>
    </motion.div>
  )
}
