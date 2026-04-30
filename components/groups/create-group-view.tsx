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
    <div className="min-h-screen bg-background flex flex-col md:pb-12">
      {/* --- MOBILE VERSION (Original) --- */}
      <div className="md:hidden flex flex-col flex-1">
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
                key="step1-mobile"
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
                key="step2-mobile"
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

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search friends by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                  />
                </div>

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

      {/* --- DESKTOP VERSION --- */}
      <div className="hidden md:flex flex-col flex-1">
        <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Create New Group</h1>
                <p className="text-sm text-muted-foreground font-medium">Step {step} of 2: {step === 1 ? 'Configure Group Identity' : 'Invite Your Squad'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
                      s === step ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 
                      s < step ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {s < step ? <Check className="w-5 h-5" /> : s}
                    </div>
                    {s === 1 && <div className={`w-12 h-1 mx-2 rounded-full ${step > 1 ? 'bg-primary' : 'bg-secondary'}`} />}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-2xl px-6 h-12 font-bold">
                    Previous
                  </Button>
                )}
                <Button 
                  onClick={() => (step < 2 ? setStep(step + 1) : handleCreate())}
                  disabled={!canProceed || isCreating}
                  className="rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/20"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : step < 2 ? 'Continue' : 'Launch Group'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1-desktop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-12 gap-12"
              >
                <div className="col-span-5 space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tighter leading-tight">What's this group <br/> going to be called?</h2>
                    <p className="text-muted-foreground text-lg font-medium">Give it a recognizable name for everyone.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Group Name</label>
                    <Input
                      placeholder="e.g., Road Trip, Family, Apartment"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="h-20 bg-card border-2 border-border/50 text-2xl font-black rounded-3xl px-8 focus:ring-4 focus:ring-primary/10 transition-all"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Choose a Category</label>
                    <div className="grid grid-cols-3 gap-4">
                      {groupTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all border-2 ${
                            selectedType === type.id
                              ? "bg-primary/5 border-primary shadow-xl shadow-primary/5"
                              : "bg-card border-transparent hover:border-border/50"
                          }`}
                        >
                          <span className="text-4xl">{type.emoji}</span>
                          <span className="text-sm font-black">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-7">
                  <div className="glass-card rounded-[3.5rem] p-12 border border-primary/5 h-full flex flex-col items-center justify-center text-center">
                    <div className="relative mb-10">
                      <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-8xl shadow-2xl animate-pulse-slow">
                        {selectedEmoji}
                      </div>
                      <div className="absolute -bottom-4 -right-4 bg-background border-2 border-primary rounded-2xl p-3 shadow-xl">
                        <span className="text-xs font-black uppercase tracking-widest px-2">Group Icon</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                      {groupEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setSelectedEmoji(emoji)}
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                            selectedEmoji === emoji
                              ? "bg-primary text-white scale-110 shadow-xl"
                              : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:scale-105"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2-desktop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-12 gap-12"
              >
                <div className="col-span-7 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tighter leading-tight">Who's in the squad?</h2>
                    <p className="text-muted-foreground text-lg font-medium">Add members to <span className="text-primary font-black">{groupName}</span> to start splitting.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                    <Input
                      placeholder="Search friends by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-16 h-16 bg-card border-2 border-border/50 text-lg rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {isSearching ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {searchedUsers?.map((user) => {
                          const isSelected = selectedMembers.some(m => m._id === user._id)
                          return (
                            <button
                              key={user._id}
                              onClick={() => toggleMember(user)}
                              className={`flex items-center gap-4 p-5 rounded-3xl transition-all border-2 ${
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
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-5 space-y-6">
                  <div className="glass-card rounded-[3rem] p-8 border border-primary/5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black">Selected Members</h3>
                      <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{selectedMembers.length} Joined</span>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
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
                    <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
                      <button onClick={onInviteFriend} className="w-full flex items-center gap-4 p-5 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20 hover:bg-primary/10 transition-all text-left">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-black">Invite Someone New</div>
                          <div className="text-xs font-bold text-primary/60 uppercase tracking-widest mt-1">Via secure link</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
