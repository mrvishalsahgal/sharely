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
}

export function PeopleView({ onBack, onSettle }: PeopleViewProps) {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
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

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-border shadow-sm"
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
              <h2 className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                Search Results
              </h2>
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : searchedUsers?.length === 0 ? (
                <div className="text-center py-8 bg-card rounded-2xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchedUsers?.map((user) => {
                    const isFriend = friendIds.includes(user._id || user.id)
                    return (
                      <div
                        key={user._id || user.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 group"
                      >
                        <div className={`w-12 h-12 rounded-full ${user.color || 'bg-primary'} flex items-center justify-center text-lg font-bold text-white shadow-inner`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {isFriend ? (
                          <div className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            Friend
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(user._id || user.id)}
                            disabled={isConnecting === (user._id || user.id)}
                            className="rounded-full px-4"
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
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Your Friends {friends?.length ? `(${friends.length})` : ''}
            </h2>
          </div>

          {friendsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : !friends || friends.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border px-8">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">No friends yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Search for friends above or add them to groups to start splitting expenses.
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
                    className={`flex flex-col p-4 rounded-3xl bg-card border transition-all overflow-hidden ${
                      isExpanded ? 'border-primary ring-1 ring-primary/20 shadow-lg' : 'border-border/50 hover:shadow-md'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-4 cursor-pointer group"
                      onClick={() => setExpandedFriendId(isExpanded ? null : (friend._id || friend.id))}
                    >
                      <div className={`w-14 h-14 rounded-2xl ${friend.color || 'bg-primary'} flex items-center justify-center text-xl font-bold text-white shadow-lg shrink-0`}>
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate">{friend.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          className="p-2 rounded-xl hover:bg-secondary transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-4"
                        >
                          <div className="space-y-4">
                            {/* Balance & Actions */}
                            <div className="p-4 rounded-2xl bg-secondary/30 flex items-center justify-between">
                              <div className="flex flex-col">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
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
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onSettle(balance)
                                    }}
                                    className={`rounded-xl px-6 h-10 ${isOwed ? 'bg-positive hover:bg-positive/90 text-positive-foreground' : 'bg-gradient-to-r from-primary to-accent text-white'}`}
                                  >
                                    {isOwed ? 'Remind' : 'Settle'}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveFriend(friend._id || friend.id)
                                  }}
                                  className="rounded-xl text-negative hover:bg-negative/10"
                                >
                                  <UserMinus className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="space-y-3">
                              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                                Recent Transactions
                              </h3>
                              <FriendTransactions friendId={friend._id || friend.id} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
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
