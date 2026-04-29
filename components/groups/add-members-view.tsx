"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Search,
  Check,
  Plus,
  UserPlus,
  Link as LinkIcon,
  Copy,
  Share2,
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
  const [linkCopied, setLinkCopied] = useState(false)

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

  const copyInviteLink = () => {
    if (!group?.id) return
    navigator.clipboard.writeText(`https://splitsmart.app/invite/${group.id}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
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
        {/* Invite Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-4 border border-primary/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Share Invite Link</div>
              <div className="text-sm text-muted-foreground">
                Anyone with the link can join
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={copyInviteLink}
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            <Button variant="secondary">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

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
          transition={{ delay: 0.1 }}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            Your Friends
          </h2>

          {groupLoading || isSearching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : searchedUsers?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No friends found matching your search"
                  : "All your friends are already in this group"}
              </p>
              <Button variant="outline" onClick={onInviteFriend}>
                Invite New Friend
              </Button>
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
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-card hover:bg-secondary"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-12 h-12 rounded-full ${user.color || 'bg-primary'} flex items-center justify-center text-lg font-medium text-white`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                </motion.button>
              )
            })
          )}
        </motion.div>

        {/* Invite New */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onInviteFriend}
            className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-dashed border-border hover:border-primary transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Invite New Friend</div>
              <div className="text-sm text-muted-foreground">
                Send an invite via email or link
              </div>
            </div>
          </button>
        </motion.div>
      </main>
    </div>
  )
}
