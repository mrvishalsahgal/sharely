"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  User,
  Check,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { currentUser } from "@/lib/mock-data"

interface ProfileViewProps {
  onBack: () => void
  onOpenSettings: () => void
  onOpenActivity: () => void
}

export function ProfileView({ onBack, onOpenSettings, onOpenActivity }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    username: "johndoe",
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  const stats = [
    { label: "Groups", value: "5" },
    { label: "Friends", value: "12" },
    { label: "Expenses", value: "47" },
  ]

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <Button
            variant={isEditing ? "default" : "ghost"}
            size="sm"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : isEditing ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Save
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-8"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-primary-foreground">
              {profile.name.charAt(0)}
            </div>
            {isEditing && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
          <p className="text-muted-foreground">@{profile.username}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-4 text-center border border-border"
            >
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Profile Fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="bg-secondary border-0"
                  />
                ) : (
                  <p className="font-medium">{profile.name}</p>
                )}
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="bg-secondary border-0"
                  />
                ) : (
                  <p className="font-medium">{profile.email}</p>
                )}
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="bg-secondary border-0"
                  />
                ) : (
                  <p className="font-medium">{profile.phone}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-2"
        >
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-secondary transition-colors"
          >
            <span className="font-medium">Settings</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
          <button
            onClick={onOpenActivity}
            className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-secondary transition-colors"
          >
            <span className="font-medium">Activity History</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </motion.div>
      </main>
    </div>
  )
}
