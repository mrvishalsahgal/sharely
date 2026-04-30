"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  User as UserIcon,
  Check,
  Pencil,
  Loader2,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

interface ProfileViewProps {
  onBack: () => void
  onOpenSettings: () => void
  onOpenActivity: () => void
}

import { useState, useEffect } from "react"

export function ProfileView({ onBack, onOpenSettings, onOpenActivity }: ProfileViewProps) {
  const { data: user, mutate, isLoading } = useSWR<any>('/api/users/me', fetcher)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
  })

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        username: user.email?.split('@')[0] || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone
        })
      })
      mutate()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading profile...</p>
      </div>
    )
  }

  const stats = [
    { label: "Groups", value: "5" },
    { label: "Friends", value: "12" },
    { label: "Expenses", value: "47" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col md:pb-12">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="md:hidden sticky top-0 z-50 glass-card border-b border-border/50">
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

      {/* Desktop Header - Visible only on Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Your Profile</h1>
              <p className="text-sm text-muted-foreground font-medium">Manage your personal information and view your account stats.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
              className="rounded-2xl px-8 py-6 font-black gap-2 transition-all shadow-lg"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isEditing ? (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              ) : (
                <>
                  <Pencil className="w-5 h-5" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg md:max-w-7xl mx-auto w-full p-4 md:px-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Avatar & Stats */}
          <div className="md:col-span-4 space-y-8">
            <div className="glass-card rounded-[3rem] p-10 flex flex-col items-center border border-primary/5 shadow-2xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
              
              <div className="relative group">
                <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl font-black text-white shadow-2xl transition-transform group-hover:scale-105">
                  {profile.name.charAt(0)}
                </div>
                {isEditing && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-background border-2 border-primary shadow-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  >
                    <Camera className="w-6 h-6" />
                  </motion.button>
                )}
              </div>
              
              <div className="text-center mt-8">
                <h2 className="text-3xl font-black tracking-tight">{profile.name}</h2>
                <p className="text-primary font-bold mt-1">@{profile.username}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full mt-10">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center p-4 rounded-2xl bg-secondary/30 border border-border/50"
                  >
                    <div className="text-xl font-black">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links (Desktop) */}
            <div className="hidden md:flex flex-col gap-3">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-4 mb-2">Quick Navigation</h4>
              <button
                onClick={onOpenSettings}
                className="group flex items-center justify-between p-6 bg-card rounded-3xl border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg">Settings</span>
                </div>
                <ArrowLeft className="w-5 h-5 rotate-180 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
              <button
                onClick={onOpenActivity}
                className="group flex items-center justify-between p-6 bg-card rounded-3xl border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ActivityIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg">Activity History</span>
                </div>
                <ArrowLeft className="w-5 h-5 rotate-180 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-8 space-y-8">
            <div className="glass-card rounded-[3rem] p-10 border border-border/50 shadow-sm">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <Pencil className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="bg-secondary/50 border-0 h-14 rounded-2xl font-bold px-6 focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <p className="text-xl font-bold px-1">{profile.name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="bg-secondary/50 border-0 h-14 rounded-2xl font-bold px-6 focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <p className="text-xl font-bold px-1">{profile.email}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="bg-secondary/50 border-0 h-14 rounded-2xl font-bold px-6 focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <p className="text-xl font-bold px-1">{profile.phone || "Not set"}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-12 pt-8 border-t border-border/50 flex justify-end">
                   <Button
                     onClick={handleSave}
                     disabled={isSaving}
                     className="rounded-2xl h-14 px-10 font-black shadow-xl"
                   >
                     {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile Details"}
                   </Button>
                </div>
              )}
            </div>

            {/* Account Security Preview (Desktop) */}
            <div className="hidden md:block p-10 glass-card rounded-[3rem] bg-gradient-to-br from-background to-secondary/30 border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black mb-2">Security Status</h4>
                  <p className="text-muted-foreground font-medium">Your account is secured with standard encryption.</p>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 font-bold px-6">
                  Manage Security
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Quick Links (Restored to original) */}
          <div className="md:hidden mt-6 space-y-2">
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
          </div>
        </div>
      </main>
    </div>
  )
}
