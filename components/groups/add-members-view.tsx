"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Search,
  Check,
  Plus,
  UserPlus,
  Users,
  X,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Loader2 } from "lucide-react"

interface AddMembersViewProps {
  groupId: string
  onBack: () => void
  onInviteFriend: () => void
}

export function AddMembersView({ groupId, onBack, onInviteFriend }: AddMembersViewProps) {
  const { data: group, isLoading: groupLoading } = useSWR<any>(`/api/groups/${groupId}`, fetcher)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const { data: searchedUsers, isLoading: isSearching } = useSWR<any[]>(
    `/api/users?q=${searchQuery}`,
    fetcher
  )

  const existingMemberIds = group?.members?.map((m: any) => m._id) || []
  
  const toggleMember = (user: any) => {
    setSelectedMembers((prev) =>
      prev.find(m => m._id === user._id)
        ? prev.filter((m) => m._id !== user._id)
        : [...prev, user]
    )
  }

  const handleAdd = async () => {
    setIsAdding(true)
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: [...existingMemberIds, ...selectedMembers.map(m => m._id)]
        })
      })

      if (!response.ok) throw new Error("Failed to add members")
      onBack()
    } catch (error) {
      console.error("Add members error:", error)
      setIsAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* --- MOBILE VERSION --- */}
      <div className="md:hidden flex flex-col flex-1">
        <header className="sticky top-0 z-50 glass-card border-b border-border/50">
          <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold">Add Members</h1>
                <p className="text-sm text-muted-foreground">{group?.name}</p>
              </div>
            </div>
            {selectedMembers.length > 0 && (
              <Button onClick={handleAdd} disabled={isAdding} size="sm">
                {isAdding ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>Add ({selectedMembers.length})</>
                )}
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
          {/* Existing Members */}
          {group?.members && group.members.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground px-1">
                Group Members ({group.members.length})
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {group.members.map((member: any) => (
                  <div 
                    key={member._id} 
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50"
                  >
                    <div className={`w-10 h-10 rounded-full ${member.color || 'bg-primary'} flex items-center justify-center text-sm font-medium text-white`}>
                      {(member.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                      Member
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative pt-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground px-1 mb-2">
              Add New Members
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
          </motion.div>

          {/* User List */}
          <div className="space-y-2">
            {groupLoading || isSearching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : searchedUsers?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4 text-sm">No friends found</p>
              </div>
            ) : (
              searchedUsers?.map((user) => {
                const isSelected = selectedMembers.some(m => m._id === user._id)
                const isAlreadyMember = existingMemberIds.includes(user._id)
                if (isAlreadyMember) return null

                return (
                  <motion.button
                    key={user._id}
                    onClick={() => toggleMember(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected ? "bg-primary/10 ring-1 ring-primary" : "bg-card hover:bg-secondary"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-12 h-12 rounded-full ${user.color || 'bg-primary'} flex items-center justify-center text-lg font-medium text-white`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </motion.button>
                )
              })
            )}
          </div>

          {/* Invite New */}
          <button
            onClick={onInviteFriend}
            className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-dashed border-border hover:border-primary transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Invite New Friend</div>
              <div className="text-xs text-muted-foreground">Send an invite link</div>
            </div>
          </button>
        </main>
      </div>

      {/* --- DESKTOP VERSION --- */}
      <div className="hidden md:flex flex-col flex-1 max-w-7xl mx-auto w-full px-8 py-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all shadow-sm"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">Expansion Mode</span>
                <h1 className="text-3xl font-black tracking-tight">Add Group Members</h1>
              </div>
              <p className="text-muted-foreground font-medium">Updating squad for <span className="text-foreground font-bold">{group?.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-muted-foreground">
              {selectedMembers.length} selected
            </span>
            <Button 
              onClick={handleAdd} 
              disabled={selectedMembers.length === 0 || isAdding}
              className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
            >
              {isAdding ? <Loader2 className="w-6 h-6 animate-spin" /> : `Add to Group`}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 flex-1">
          {/* Left Column: Search and Results */}
          <div className="col-span-7 space-y-6 flex flex-col">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                placeholder="Search friends by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-16 bg-card border-2 border-border/50 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="flex-1 bg-card/30 rounded-[2.5rem] border border-border/50 p-6 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {searchQuery ? "Search Results" : "Suggested Friends"}
                </h2>
                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {searchedUsers?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                      <UserPlus className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-black mb-2">No friends found</h3>
                    <p className="text-muted-foreground font-medium mb-8">Try a different search or invite someone new.</p>
                    <button 
                      onClick={onInviteFriend}
                      className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Invite to SplitSmart
                    </button>
                  </div>
                ) : (
                  searchedUsers?.map((user) => {
                    const isSelected = selectedMembers.some(m => m._id === user._id)
                    const isAlreadyMember = existingMemberIds.includes(user._id)
                    if (isAlreadyMember) return null

                    return (
                      <button
                        key={user._id}
                        onClick={() => toggleMember(user)}
                        className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border-2 ${
                          isSelected ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-card border-transparent hover:bg-secondary/50"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl ${user.color || 'bg-primary'} flex items-center justify-center text-xl font-black text-white shadow-md`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-black text-lg">{user.name}</div>
                          <div className="text-sm text-muted-foreground font-medium">{user.email}</div>
                        </div>
                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                          isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                        }`}>
                          {isSelected ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Group Status */}
          <div className="col-span-5 space-y-6">
            {/* Selected for addition */}
            <AnimatePresence>
              {selectedMembers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card rounded-[2.5rem] p-8 border border-primary/20 bg-primary/[0.02]"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black">Adding Now</h3>
                    </div>
                    <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedMembers.length} Selected</span>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedMembers.map((user) => (
                      <div key={user._id} className="flex items-center gap-3 bg-background p-3 rounded-2xl border border-border/50 group">
                        <div className={`w-10 h-10 rounded-xl ${user.color || 'bg-primary'} flex items-center justify-center text-sm font-black text-white`}>
                          {user.name.charAt(0)}
                        </div>
                        <span className="flex-1 font-bold truncate">{user.name}</span>
                        <button onClick={() => toggleMember(user)} className="p-2 rounded-lg hover:bg-negative/10 text-muted-foreground hover:text-negative transition-all opacity-0 group-hover:opacity-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Members */}
            <div className="glass-card rounded-[2.5rem] p-8 border border-border/50 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-black">Current Squad</h3>
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group?.members?.length || 0} Members</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {group?.members?.map((member: any) => (
                  <div key={member._id} className="flex items-center gap-3 bg-secondary/20 p-4 rounded-2xl border border-transparent">
                    <div className={`w-10 h-10 rounded-xl ${member.color || 'bg-primary'} flex items-center justify-center text-sm font-black text-white shadow-sm`}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate font-medium">{member.email}</p>
                    </div>
                    <div className="bg-background/50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-muted-foreground border border-border/50">
                      Member
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-border/50">
                <button 
                  onClick={onInviteFriend}
                  className="w-full flex items-center gap-4 p-5 bg-secondary/30 rounded-3xl border-2 border-dashed border-border hover:bg-secondary/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-black">Invite Someone New</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Via secure link</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
