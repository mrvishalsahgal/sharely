'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Users, ChevronRight, Sparkles, User, ArrowLeft, Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { categories } from '@/lib/mock-data'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expense: ExpenseData) => void
  defaultGroupId?: string
}

interface ExpenseData {
  description: string
  amount: number
  category: string
  splitWith: { id: string; amount: number }[]
  groupId?: string
}

interface CustomSplitAmounts {
  [userId: string]: string
}

export function AddExpenseModal({ isOpen, onClose, onAdd, defaultGroupId }: AddExpenseModalProps) {
  const { data: groupsData } = useSWR<any[]>('/api/groups', fetcher)
  const { data: usersData } = useSWR<any[]>('/api/users', fetcher)
  
  const groups = groupsData || []
  const users = usersData || []

  const [step, setStep] = useState(0)
  const [expenseType, setExpenseType] = useState<'group' | 'people' | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(defaultGroupId || null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')
  const [customAmounts, setCustomAmounts] = useState<CustomSplitAmounts>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultGroupId) {
        setExpenseType('group')
        setSelectedGroupId(defaultGroupId)
        const group = groups.find(g => (g._id || g.id) === defaultGroupId)
        if (group) {
          setSelectedMembers(group.members.map((m: any) => m._id))
        }
        setStep(1)
      } else {
        setStep(0)
        setExpenseType(null)
        setSelectedGroupId(null)
        setSelectedMembers([])
      }
      setAmount('')
      setDescription('')
      setSelectedCategory(null)
      setSplitType('equal')
      setCustomAmounts({})
      setShowSuccess(false)
    }
  }, [isOpen, defaultGroupId, groups.length])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: description,
          amount: parseFloat(amount),
          category: selectedCategory || 'other',
          groupId: selectedGroupId,
          splitWith: selectedMembers
        })
      })

      if (!response.ok) throw new Error('Failed to add expense')

      setIsSubmitting(false)
      setShowSuccess(true)
      
      setTimeout(() => {
        onAdd({
          description,
          amount: parseFloat(amount),
          category: selectedCategory || 'other',
          splitWith: selectedMembers.map(id => ({ id, amount: 0 })), // Simplified for now
          groupId: selectedGroupId || undefined,
        })
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Add expense error:', error)
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep(0)
    setExpenseType(null)
    setSelectedGroupId(null)
    setAmount('')
    setDescription('')
    setSelectedCategory(null)
    setSelectedMembers([])
    setSplitType('equal')
    setCustomAmounts({})
    setShowSuccess(false)
    onClose()
  }

  const totalAmount = parseFloat(amount || '0')
  const customTotal = Object.values(customAmounts).reduce((sum, val) => sum + parseFloat(val || '0'), 0)
  const remainingAmount = totalAmount - customTotal
  const isCustomSplitValid = splitType === 'equal' || Math.abs(remainingAmount) < 0.01

  const equalSplitAmount = selectedMembers.length > 0 
    ? totalAmount / (selectedMembers.length + 1) 
    : totalAmount

  const canProceed = () => {
    switch (step) {
      case 0: return expenseType !== null && (expenseType === 'people' || selectedGroupId !== null)
      case 1: return amount !== '' && parseFloat(amount) > 0 && description !== ''
      case 2: return selectedCategory !== null
      case 3: return selectedMembers.length > 0 && isCustomSplitValid
      default: return false
    }
  }

  const handleNext = () => {
    if (step === 0 && expenseType === 'group' && selectedGroupId) {
      const group = groups.find(g => (g._id || g.id) === selectedGroupId)
      if (group) {
        setSelectedMembers(group.members.map((m: any) => m._id))
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    if (step === 1 && defaultGroupId) {
      handleClose()
    } else {
      setStep(step - 1)
    }
  }

  const stepTitles = ['Add Expense', 'Enter Amount', 'Category', 'Split']

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:w-[480px] sm:max-w-[90vw] bg-card sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                {step > 0 && !showSuccess && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBack}
                    className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                )}
                <h2 className="text-lg font-semibold">
                  {showSuccess ? 'Done!' : stepTitles[step]}
                </h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Progress dots */}
            {!showSuccess && (
              <div className="flex justify-center gap-2 py-3">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/60' : 'w-1.5 bg-secondary'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <SuccessAnimation amount={totalAmount} splitCount={selectedMembers.length + 1} />
                ) : step === 0 ? (
                  <Step0
                    expenseType={expenseType}
                    setExpenseType={setExpenseType}
                    selectedGroupId={selectedGroupId}
                    setSelectedGroupId={setSelectedGroupId}
                    groups={groups}
                  />
                ) : step === 1 ? (
                  <Step1
                    amount={amount}
                    setAmount={setAmount}
                    description={description}
                    setDescription={setDescription}
                    onNext={handleNext}
                  />
                ) : step === 2 ? (
                  <Step2
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    onNext={handleNext}
                  />
                ) : (
                  <Step3
                    users={expenseType === 'group' && selectedGroupId 
                      ? groups.find(g => (g._id || g.id) === selectedGroupId)?.members || []
                      : users
                    }
                    selectedMembers={selectedMembers}
                    setSelectedMembers={setSelectedMembers}
                    splitType={splitType}
                    setSplitType={setSplitType}
                    amount={totalAmount}
                    customAmounts={customAmounts}
                    setCustomAmounts={setCustomAmounts}
                    equalSplitAmount={equalSplitAmount}
                    isGroupMode={expenseType === 'group'}
                    remainingAmount={remainingAmount}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!showSuccess && (
              <div className="px-5 pb-5 pt-3 border-t border-border/50 bg-card">
                {/* Split summary for step 3 */}
                {step === 3 && selectedMembers.length > 0 && (
                  <div className="mb-4 p-3 rounded-2xl bg-secondary/50">
                    {splitType === 'equal' ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {selectedMembers.length + 1} people
                        </span>
                        <span className="font-semibold">${equalSplitAmount.toFixed(2)} each</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Others owe</span>
                          <span className="font-medium">${customTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Your share</span>
                          <span className={`font-semibold ${remainingAmount < 0 ? 'text-negative' : 'text-positive'}`}>
                            ${remainingAmount.toFixed(2)}
                          </span>
                        </div>
                        {!isCustomSplitValid && remainingAmount < 0 && (
                          <p className="text-xs text-negative mt-1">
                            Over by ${Math.abs(remainingAmount).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={step < 3 ? handleNext : handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : step < 3 ? (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    'Split Expense'
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Step 0: Group or People selection (only shown from home)
function Step0({
  expenseType,
  setExpenseType,
  selectedGroupId,
  setSelectedGroupId,
  groups
}: {
  expenseType: 'group' | 'people' | null
  setExpenseType: (v: 'group' | 'people') => void
  selectedGroupId: string | null
  setSelectedGroupId: (v: string | null) => void
  groups: any[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      <p className="text-sm text-muted-foreground">How do you want to split?</p>
      
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setExpenseType('group')
            setSelectedGroupId(null)
          }}
          className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
            expenseType === 'group'
              ? 'border-primary bg-primary/5'
              : 'border-transparent bg-secondary hover:bg-secondary/80'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            expenseType === 'group' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <Users className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-medium">Group</p>
            <p className="text-xs text-muted-foreground">With a group</p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setExpenseType('people')
            setSelectedGroupId(null)
          }}
          className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
            expenseType === 'people'
              ? 'border-primary bg-primary/5'
              : 'border-transparent bg-secondary hover:bg-secondary/80'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            expenseType === 'people' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <User className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-medium">People</p>
            <p className="text-xs text-muted-foreground">Pick friends</p>
          </div>
        </motion.button>
      </div>

      {/* Group selection */}
      <AnimatePresence>
        {expenseType === 'group' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Select group</p>
            <div className="space-y-2">
              {groups.map((group, index) => {
                const isSelected = selectedGroupId === (group._id || group.id)
                return (
                  <motion.button
                    key={group._id || group.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedGroupId(group._id || group.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                      {group.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.members.length} members</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Step 1: Amount and description
function Step1({ 
  amount, 
  setAmount, 
  description, 
  setDescription,
  onNext 
}: {
  amount: string
  setAmount: (v: string) => void
  description: string
  setDescription: (v: string) => void
  onNext: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Amount */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-3">How much?</p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-4xl font-bold text-muted-foreground">$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && amount && description && onNext()}
            placeholder="0"
            className="text-5xl font-bold bg-transparent outline-none w-40 text-center"
            autoFocus
          />
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2">
        {['20', '50', '100', '200'].map(val => (
          <motion.button
            key={val}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAmount(val)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              amount === val 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            ${val}
          </motion.button>
        ))}
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
          What for?
        </label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && amount && description && onNext()}
          placeholder="Dinner, groceries, rent..."
          className="w-full py-3 px-4 rounded-xl bg-secondary outline-none focus:ring-2 ring-primary/50 transition-all"
        />
      </div>
    </motion.div>
  )
}

// Step 2: Category
function Step2({ 
  selectedCategory, 
  setSelectedCategory,
  onNext 
}: {
  selectedCategory: string | null
  setSelectedCategory: (v: string) => void
  onNext: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">Pick a category</p>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedCategory(cat.id)
              setTimeout(onNext, 150)
            }}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <span className="text-xl">{cat.emoji}</span>
            <span className="text-xs font-medium">{cat.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// Step 3: Split with members
function Step3({ 
  users, 
  selectedMembers, 
  setSelectedMembers,
  splitType,
  setSplitType,
  amount,
  customAmounts,
  setCustomAmounts,
  equalSplitAmount,
  isGroupMode,
  remainingAmount
}: {
  users: any[]
  selectedMembers: string[]
  setSelectedMembers: (v: string[]) => void
  splitType: 'equal' | 'custom'
  setSplitType: (v: 'equal' | 'custom') => void
  amount: number
  customAmounts: CustomSplitAmounts
  setCustomAmounts: (v: CustomSplitAmounts) => void
  equalSplitAmount: number
  isGroupMode: boolean
  remainingAmount: number
}) {
  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id))
      const newAmounts = { ...customAmounts }
      delete newAmounts[id]
      setCustomAmounts(newAmounts)
    } else {
      setSelectedMembers([...selectedMembers, id])
    }
  }

  const handleCustomAmountChange = (userId: string, value: string) => {
    setCustomAmounts({ ...customAmounts, [userId]: value })
  }

  const distributeEqually = () => {
    const perPerson = amount / (selectedMembers.length + 1)
    const newAmounts: CustomSplitAmounts = {}
    selectedMembers.forEach(id => {
      newAmounts[id] = perPerson.toFixed(2)
    })
    setCustomAmounts(newAmounts)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Split type toggle */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl">
        <button
          onClick={() => setSplitType('equal')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            splitType === 'equal' ? 'bg-card shadow-sm' : ''
          }`}
        >
          Equal
        </button>
        <button
          onClick={() => setSplitType('custom')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            splitType === 'custom' ? 'bg-card shadow-sm' : ''
          }`}
        >
          Custom
        </button>
      </div>

      {/* Quick action */}
      {!isGroupMode && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedMembers(users.map(u => u._id || u.id))}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Split with everyone
        </motion.button>
      )}

      {/* Custom split helper */}
      {splitType === 'custom' && selectedMembers.length > 0 && (
        <button
          onClick={distributeEqually}
          className="w-full text-center text-xs text-primary hover:underline"
        >
          Distribute ${amount.toFixed(2)} equally
        </button>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {users.map((user, index) => {
          const userId = user._id || user.id
          const isSelected = selectedMembers.includes(userId)
          const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
          const userAmount = customAmounts[userId] || ''

          return (
            <motion.div
              key={userId}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-xl overflow-hidden transition-all ${
                isSelected ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-secondary'
              }`}
            >
              <button
                onClick={() => toggleMember(userId)}
                className="w-full flex items-center gap-3 p-3"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${user.color || 'bg-primary'} text-primary-foreground`}>
                  {initials}
                </div>
                <span className="flex-1 text-left font-medium text-sm">{user.name}</span>
                {splitType === 'equal' && isSelected && (
                  <span className="text-xs text-muted-foreground">${equalSplitAmount.toFixed(2)}</span>
                )}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </button>

              {/* Custom amount input - inline */}
              {splitType === 'custom' && isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-3"
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border/50">
                    <span className="text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={userAmount}
                      onChange={(e) => handleCustomAmountChange(userId, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="0.00"
                      className="flex-1 bg-transparent outline-none text-sm font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Success animation
function SuccessAnimation({ amount, splitCount }: { amount: number; splitCount: number }) {
  const splitAmount = amount / splitCount

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-10"
    >
      <div className="relative w-40 h-40 mb-6">
        {/* Center coin */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 0] }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-chart-4 to-chart-5 flex items-center justify-center text-2xl font-bold">
            ${amount.toFixed(0)}
          </div>
        </motion.div>

        {/* Split coins */}
        {Array.from({ length: splitCount }).map((_, i) => {
          const angle = (i / splitCount) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angle) * 50
          const y = Math.sin(angle) * 50

          return (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
              animate={{ scale: 1, x, y, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-positive to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                ${splitAmount.toFixed(0)}
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
          className="w-10 h-10 rounded-full bg-positive flex items-center justify-center mx-auto mb-3"
        >
          <Check className="w-5 h-5 text-positive-foreground" />
        </motion.div>
        <h3 className="text-xl font-bold mb-1">Expense Added!</h3>
        <p className="text-sm text-muted-foreground">
          Split ${amount.toFixed(2)} with {splitCount - 1} {splitCount === 2 ? 'person' : 'people'}
        </p>
      </motion.div>
    </motion.div>
  )
}
