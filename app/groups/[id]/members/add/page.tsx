"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
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
import { groups, users } from "@/lib/mock-data"

export default function AddMembersPage() {
  const router = useRouter()
  const params = useParams()
  const group = groups.find((g) => g.id === params.id) || groups[0]

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const existingMemberIds = group.members.map((m: any) => m.id)
  const availableUsers = users.filter(
    (u) => u.id !== "current" && !existingMemberIds.includes(u.id)
  )
  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAdd = async () => {
    setIsAdding(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.back()
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://splitsmart.app/invite/${group.id}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Add Members</h1>
              <p className="text-sm text-muted-foreground">{group.name}</p>
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

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
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

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-border"
          />
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

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No friends found matching your search"
                  : "All your friends are already in this group"}
              </p>
              <Button variant="outline" asChild>
                <Link href="/friends/invite">Invite New Friend</Link>
              </Button>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedMembers.includes(user.id)
              return (
                <motion.button
                  key={user.id}
                  onClick={() => toggleMember(user.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-card hover:bg-secondary"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-12 h-12 rounded-full ${user.color} flex items-center justify-center text-lg font-medium text-white`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      @{user.name.toLowerCase().replace(" ", "")}
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
          <Link
            href="/friends/invite"
            className="flex items-center gap-3 p-3 bg-card rounded-xl border border-dashed border-border hover:border-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <div className="font-medium">Invite New Friend</div>
              <div className="text-sm text-muted-foreground">
                Send an invite via email or link
              </div>
            </div>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
