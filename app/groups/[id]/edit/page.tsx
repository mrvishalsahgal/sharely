"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Trash2,
  UserPlus,
  UserMinus,
  Settings,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { groups, users } from "@/lib/mock-data"

const groupEmojis = [
  "🏠", "🚗", "🍕", "🎉", "🏖️", "✈️", "🎬", "🏋️", "🎮", "🛒", "💼", "🎓",
]

export default function EditGroupPage() {
  const router = useRouter()
  const params = useParams()
  const group = groups.find((g) => g.id === params.id) || groups[0]

  const [groupName, setGroupName] = useState(group.name)
  const [selectedEmoji, setSelectedEmoji] = useState(group.emoji)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.back()
  }

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-lg font-semibold">Edit Group</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Group Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-4"
        >
          <div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center text-5xl mb-4">
            {selectedEmoji}
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {groupEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                  selectedEmoji === emoji
                    ? "bg-primary/20 ring-2 ring-primary"
                    : "bg-card hover:bg-secondary"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Group Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium">Group Name</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="h-12 bg-card border-border"
          />
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Members ({group.members.length})
            </label>
            <Link
              href={`/groups/${group.id}/members/add`}
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              Add
            </Link>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {group.members.map((member, index) => (
              <div key={member.id}>
                {index > 0 && <div className="h-px bg-border mx-4" />}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white font-medium`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.id === "current" ? "You" : member.name}
                      </div>
                      {member.id === "current" && (
                        <div className="text-xs text-primary">Admin</div>
                      )}
                    </div>
                  </div>
                  {member.id !== "current" && (
                    <button className="p-2 text-muted-foreground hover:text-negative hover:bg-negative/10 rounded-lg transition-colors">
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Group Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium">Group Settings</label>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <Link
              href={`/groups/${group.id}/settings`}
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">Advanced Settings</div>
                  <div className="text-sm text-muted-foreground">
                    Simplify debts, default split
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-negative">Danger Zone</label>
          <div className="bg-negative/5 rounded-2xl border border-negative/20 overflow-hidden">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 p-4 hover:bg-negative/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-negative/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-negative" />
              </div>
              <div className="text-left">
                <div className="font-medium text-negative">Delete Group</div>
                <div className="text-sm text-muted-foreground">
                  This action cannot be undone
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-negative/20 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-negative" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Delete Group?</h3>
            <p className="text-center text-muted-foreground mb-6">
              All expenses and balances in &quot;{group.name}&quot; will be permanently
              deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
