"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Check,
  Plus,
  X,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Loader2 } from "lucide-react"

const groupEmojis = [
  "🏠", "🚗", "🍕", "🎉", "🏖️", "✈️", "🎬", "🏋️", "🎮", "🛒", "💼", "🎓",
]

const groupTypes = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "trip", label: "Trip", emoji: "✈️" },
  { id: "event", label: "Event", emoji: "🎉" },
  { id: "couple", label: "Couple", emoji: "❤️" },
  { id: "other", label: "Other", emoji: "📦" },
]

interface CreateGroupViewProps {
  onBack: () => void
  onComplete: () => void
  onInviteFriend: () => void
}

export function CreateGroupView({ onBack, onComplete, onInviteFriend }: CreateGroupViewProps) {
  const [step, setStep] = useState(1)
  const [groupName, setGroupName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("🏠")
  const [selectedType, setSelectedType] = useState("home")
  const [selectedMembers, setSelectedMembers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const { data: searchedUsers, isLoading: isSearching } = useSWR<any[]>(
    `/api/users?q=${searchQuery}`,
    fetcher
  )

  const toggleMember = (user: any) => {
    setSelectedMembers((prev) =>
      prev.find(m => m._id === user._id)
        ? prev.filter((m) => m._id !== user._id)
        : [...prev, user]
    )
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          emoji: selectedEmoji,
          type: selectedType,
          memberIds: selectedMembers.map(m => m._id)
        })
      })

      if (!response.ok) throw new Error("Failed to create group")
      
      onComplete()
    } catch (error) {
      console.error("Create group error:", error)
      setIsCreating(false)
    }
  }

  const canProceed =
    step === 1 ? groupName.trim().length > 0 : selectedMembers.length > 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold">Create Group</h1>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold mb-2">Group Details</h2>
                <p className="text-muted-foreground">
                  Give your group a name and pick an icon
                </p>
              </div>

              {/* Emoji Picker */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center text-5xl">
                  {selectedEmoji}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {groupEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      selectedEmoji === emoji
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-card hover:bg-secondary"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  placeholder="e.g., Apartment 4B, Road Trip 2024"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-12 bg-card border-border text-center text-lg"
                  autoFocus
                />
              </div>

              {/* Group Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {groupTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        selectedType === type.id
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-card hover:bg-secondary"
                      }`}
                    >
                      <span className="text-xl">{type.emoji}</span>
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold mb-2">Add Members</h2>
                <p className="text-muted-foreground">
                  Select friends to add to{" "}
                  <span className="text-foreground">{groupName}</span>
                </p>
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-card rounded-xl border border-border">
                  {selectedMembers.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-2 py-1"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${user.color || 'bg-primary'} flex items-center justify-center text-xs font-medium text-white`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm">{user.name.split(" ")[0]}</span>
                      <button
                        onClick={() => toggleMember(user)}
                        className="w-4 h-4 rounded-full hover:bg-muted flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search friends by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                />
              </div>

              {/* User List */}
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground px-1 mb-2">
                  {searchQuery ? "Search Results" : "Your Friends"}
                </h2>
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : searchedUsers?.length === 0 ? (
                  <p className="text-center py-4 text-sm text-muted-foreground">No friends found</p>
                ) : (
                  searchedUsers?.map((user) => {
                    const isSelected = selectedMembers.some(m => m._id === user._id)
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
                  <div className="font-medium">Invite New Friend</div>
                  <div className="text-sm text-muted-foreground">
                    Send an invite link
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border p-4">
        <div className="max-w-lg mx-auto w-full">
          <Button
            onClick={() => (step < 2 ? setStep(step + 1) : handleCreate())}
            disabled={!canProceed || isCreating}
            className="w-full h-12 text-base font-semibold"
          >
            {isCreating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : step < 2 ? (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}
