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
}

export function PeopleView({ onBack }: PeopleViewProps) {
  const { mutate } = useSWRConfig()
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const { data: friends, isLoading: friendsLoading } = useSWR<any[]>('/api/friends', fetcher)
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
              {friends.map((friend) => (
                <motion.div
                  layout
                  key={friend._id || friend.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 p-4 rounded-3xl bg-card border border-border/50 hover:shadow-md transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${friend.color || 'bg-primary'} flex items-center justify-center text-xl font-bold text-white shadow-lg shrink-0`}>
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{friend.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveFriend(friend._id || friend.id)}
                      className="p-3 rounded-xl hover:bg-negative/10 text-negative transition-colors"
                      title="Remove Friend"
                    >
                      <UserMinus className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
