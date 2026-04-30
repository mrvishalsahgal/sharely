'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  UserMinus, 
  Loader2, 
  User as UserIcon,
  Plus,
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import useSWR, { useSWRConfig } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PeopleViewProps {
  onBack: () => void
  onSettle: (balance: any) => void
  onInviteFriend: () => void
}

export function PeopleView({ onBack, onSettle, onInviteFriend }: PeopleViewProps) {
  const { mutate } = useSWRConfig()
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const { data: friends, isLoading: friendsLoading } = useSWR<any[]>('/api/friends', fetcher)
  const { data: balances, isLoading: balancesLoading } = useSWR<any[]>('/api/users/me/balances', fetcher)
  const { data: searchedUsers, isLoading: isSearching } = useSWR<any[]>(
    searchQuery ? `/api/users?q=${searchQuery}` : null,
    fetcher
  )

  const handleConnect = async (userId: string) => {
    setIsConnecting(userId)
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (response.ok) {
        mutate('/api/friends')
        mutate(`/api/users?q=${searchQuery}`)
      }
    } catch (error) {
      console.error('Connect error:', error)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleRemoveFriend = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return
    
    try {
      const response = await fetch(`/api/friends/${userId}`, { method: 'DELETE' })
      if (response.ok) {
        mutate('/api/friends')
      }
    } catch (error) {
      console.error('Remove friend error:', error)
    }
  }

  const [expandedFriendId, setExpandedFriendId] = useState<string | null>(null)

  const friendIds = friends?.map(f => f._id || f.id) || []

  return (
    <div className="min-h-screen bg-background flex flex-col md:pb-8">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="md:hidden sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-lg mx-auto p-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">People</h1>
        </div>
      </header>

      {/* Desktop Header - Visible only on Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">People & Friends</h1>
              <p className="text-sm text-muted-foreground font-medium">Manage your connections and tracking individual debts.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg md:max-w-7xl mx-auto w-full p-4 md:px-8 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Search & Friends List */}
          <div className="md:col-span-5 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border shadow-sm rounded-2xl"
              />
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-sm font-bold text-muted-foreground px-1 uppercase tracking-wider">
                    Search Results
                  </h2>
                  {isSearching ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : searchedUsers?.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border px-6">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-bold mb-1">User not found</h3>
                      <p className="text-xs text-muted-foreground mb-6">Want to invite them to SplitSmart instead?</p>
                      <Button onClick={onInviteFriend} size="sm" variant="outline" className="rounded-xl font-bold">
                        Invite Friend
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchedUsers?.map((user) => {
                        const isFriend = friendIds.includes(user._id || user.id)
                        return (
                          <div
                            key={user._id || user.id}
                            className="flex items-center gap-3 p-4 rounded-3xl bg-card border border-border/50 group hover:shadow-md transition-all"
                          >
                            <div className={`w-12 h-12 rounded-full ${user.color || 'bg-primary'} flex items-center justify-center text-lg font-bold text-white shadow-inner`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                            {isFriend ? (
                              <div className="px-3 py-1.5 rounded-full bg-secondary text-xs font-bold text-muted-foreground flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                Friend
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleConnect(user._id || user.id)}
                                disabled={isConnecting === (user._id || user.id)}
                                className="rounded-xl px-4 font-bold"
                              >
                                {isConnecting === (user._id || user.id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Friends List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Your Friends {friends?.length ? `(${friends.length})` : ''}
                </h2>
              </div>

              {friendsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 rounded-3xl bg-secondary animate-pulse" />
                  ))}
                </div>
              ) : !friends || friends.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-[2rem] border border-dashed border-border px-8">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">No friends yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Search for friends above to start splitting.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {friends.map((friend) => {
                    const balance = balances?.find(b => (b.user?._id || b.user?.id) === (friend._id || friend.id))
                    const amount = balance?.amount || 0
                    const isOwed = amount > 0
                    const isDebt = amount < 0
                    const isExpanded = expandedFriendId === (friend._id || friend.id)

                    return (
                      <motion.div
                        layout
                        key={friend._id || friend.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setExpandedFriendId(isExpanded ? null : (friend._id || friend.id))}
                        className={`flex items-center gap-4 p-4 rounded-3xl bg-card border transition-all cursor-pointer group ${
                          isExpanded ? 'border-primary ring-1 ring-primary/20 shadow-lg' : 'border-border/50 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl ${friend.color || 'bg-primary'} flex items-center justify-center text-xl font-bold text-white shadow-lg shrink-0`}>
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg truncate">{friend.name}</p>
                          <p className={`text-xs font-bold ${amount === 0 ? 'text-muted-foreground' : isOwed ? 'text-positive' : 'text-negative'}`}>
                            {amount === 0 ? 'Settled' : isOwed ? `Owes you $${amount.toFixed(2)}` : `You owe $${Math.abs(amount).toFixed(2)}`}
                          </p>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90 text-primary' : ''}`} />
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Friend Details (Desktop Only) */}
          <div className="hidden md:block md:col-span-7 sticky top-32">
            <AnimatePresence mode="wait">
              {expandedFriendId ? (
                <motion.div
                  key={expandedFriendId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card rounded-[2.5rem] p-10 border border-primary/5 shadow-2xl shadow-primary/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                  
                  {friends?.find(f => (f._id || f.id) === expandedFriendId) && (() => {
                    const friend = friends.find(f => (f._id || f.id) === expandedFriendId)
                    const balance = balances?.find(b => (b.user?._id || b.user?.id) === (friend._id || friend.id))
                    const amount = balance?.amount || 0
                    const isOwed = amount > 0
                    const isDebt = amount < 0

                    return (
                      <div className="relative z-10 space-y-10">
                        {/* Detail Header */}
                        <div className="flex items-center gap-6">
                          <div className={`w-24 h-24 rounded-[2rem] ${friend.color || 'bg-primary'} flex items-center justify-center text-4xl font-black text-white shadow-2xl`}>
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-3xl font-black tracking-tight">{friend.name}</h3>
                            <p className="text-muted-foreground font-medium">{friend.email}</p>
                            <div className="flex gap-4 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl font-bold"
                                onClick={() => handleRemoveFriend(friend._id || friend.id)}
                              >
                                <UserMinus className="w-4 h-4 mr-2 text-negative" />
                                Remove Connection
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl font-bold"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Balance Summary Card */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className={`p-6 rounded-3xl border border-border/50 ${amount === 0 ? 'bg-secondary/30' : isOwed ? 'bg-positive/10 border-positive/20' : 'bg-negative/10 border-negative/20'}`}>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Total Balance</p>
                            <p className={`text-3xl font-black ${amount === 0 ? 'text-muted-foreground' : isOwed ? 'text-positive' : 'text-negative'}`}>
                              ${Math.abs(amount).toFixed(2)}
                            </p>
                            <p className="text-xs font-bold text-muted-foreground mt-1">
                              {amount === 0 ? 'Perfectly balanced' : isOwed ? 'They owe you' : 'You owe them'}
                            </p>
                          </div>
                          <div className="flex items-center justify-center">
                            {(isOwed || isDebt) && (
                              <Button
                                size="lg"
                                onClick={() => onSettle(balance)}
                                className={`w-full h-16 rounded-2xl text-lg font-black shadow-xl transition-all hover:scale-[1.02] ${isOwed ? 'bg-positive hover:bg-positive/90 text-white' : 'bg-gradient-to-r from-primary to-accent text-white shadow-primary/20'}`}
                              >
                                {isOwed ? 'Send Reminder' : 'Settle Up Now'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Transaction History */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Transaction History</h4>
                            <div className="h-px flex-1 bg-border/50 mx-4" />
                          </div>
                          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <FriendTransactions friendId={friend._id || friend.id} />
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[600px] flex flex-col items-center justify-center text-center p-10 glass-card rounded-[2.5rem] border-dashed border-2"
                >
                  <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                    <UserIcon className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-muted-foreground/50">Select a connection</h3>
                  <p className="text-muted-foreground/50 max-w-xs mt-2 font-medium">Click on a friend from the list to view your shared history and settle debts.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Expanded View (Tab-style, only on mobile) */}
          <div className="md:hidden">
            <AnimatePresence>
              {expandedFriendId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-border/50 space-y-6"
                >
                  {(() => {
                    const friend = friends?.find(f => (f._id || f.id) === expandedFriendId)
                    const balance = balances?.find(b => (b.user?._id || b.user?.id) === (friend?._id || friend?.id))
                    const amount = balance?.amount || 0
                    const isOwed = amount > 0
                    const isDebt = amount < 0

                    if (!friend) return null

                    return (
                      <>
                        <div className="p-4 rounded-2xl bg-secondary/30 flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                              Current Balance
                            </p>
                            <p className={`text-lg font-bold ${amount === 0 ? 'text-muted-foreground' : isOwed ? 'text-positive' : 'text-negative'}`}>
                              {amount === 0 ? 'Settled' : isOwed ? `Owes you $${amount.toFixed(2)}` : `You owe $${Math.abs(amount).toFixed(2)}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {(isOwed || isDebt) && (
                              <Button
                                size="sm"
                                onClick={() => onSettle(balance)}
                                className={`rounded-xl px-6 h-10 font-bold ${isOwed ? 'bg-positive text-white' : 'bg-primary text-white'}`}
                              >
                                {isOwed ? 'Remind' : 'Settle'}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
                            Recent Transactions
                          </h3>
                          <FriendTransactions friendId={friend._id || friend.id} />
                        </div>
                      </>
                    )
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  )
}

function FriendTransactions({ friendId }: { friendId: string }) {
  const { data: expenses, isLoading } = useSWR<any[]>(`/api/friends/${friendId}/expenses`, fetcher)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="h-16 rounded-xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="py-6 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
        <p className="text-sm text-muted-foreground">No shared transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const isPayer = (expense.paidBy?._id || expense.paidBy?.id) === friendId
        const mySplit = expense.splits.find((s: any) => (s.user?._id || s.user?.id) !== friendId) // Assuming simple 1-on-1 for now
        
        return (
          <div 
            key={expense._id || expense.id}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-border/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-lg">
                {expense.category === 'food' ? '🍕' : 
                 expense.category === 'transport' ? '🚗' : 
                 expense.category === 'entertainment' ? '🍿' : '📄'}
              </div>
              <div>
                <p className="font-medium text-sm">{expense.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(expense.createdAt).toLocaleDateString()} • {expense.groupId ? 'Group' : 'Direct'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-sm ${isPayer ? 'text-negative' : 'text-positive'}`}>
                {isPayer ? '-' : '+'}${expense.amount.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isPayer ? `They paid` : `You paid`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
