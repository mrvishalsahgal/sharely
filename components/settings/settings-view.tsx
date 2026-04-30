"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Globe,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { signOut } from "next-auth/react"

interface SettingsViewProps {
  onBack: () => void
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)

  const settingsSections = [
    {
      title: "Preferences",
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: "Dark Mode",
          description: "Use dark theme",
          type: "toggle" as const,
          value: darkMode,
          onChange: setDarkMode,
        },
        {
          icon: Globe,
          label: "Language",
          description: "English (US)",
          type: "link" as const,
          href: "/settings/language",
        },
        {
          icon: CreditCard,
          label: "Currency",
          description: "USD ($)",
          type: "link" as const,
          href: "/settings/currency",
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          description: "Get notified about expenses",
          type: "toggle" as const,
          value: pushNotifications,
          onChange: setPushNotifications,
        },
        {
          icon: Smartphone,
          label: "SMS Alerts",
          description: "For large transactions",
          type: "toggle" as const,
          value: notifications,
          onChange: setNotifications,
        },
        {
          icon: Bell,
          label: "Email Digest",
          description: "Weekly summary emails",
          type: "toggle" as const,
          value: emailNotifications,
          onChange: setEmailNotifications,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          icon: Shield,
          label: "Privacy & Security",
          description: "Password, 2FA, sessions",
          type: "link" as const,
          href: "/settings/security",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          description: "FAQs and guides",
          type: "link" as const,
          href: "/help",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col md:pb-12">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="md:hidden sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      {/* Desktop Header - Visible only on Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">System Settings</h1>
              <p className="text-sm text-muted-foreground font-medium">Customize your experience, security, and notification preferences.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg md:max-w-7xl mx-auto w-full p-4 md:px-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="flex flex-col"
            >
              <h2 className="text-sm font-black text-muted-foreground mb-4 px-2 uppercase tracking-[0.2em]">
                {section.title}
              </h2>
              <div className="flex-1 bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all">
                {section.items.map((item, index) => (
                  <div key={item.label}>
                    {index > 0 && <div className="h-px bg-border/30 mx-6" />}
                    {item.type === "toggle" ? (
                      <div className="flex items-center justify-between p-6 group hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-lg">{item.label}</div>
                            <div className="text-sm text-muted-foreground font-medium">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={item.value}
                          onCheckedChange={item.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center justify-between p-6 group hover:bg-secondary/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-lg">{item.label}</div>
                            <div className="text-sm text-muted-foreground font-medium">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          
          {/* Version & Logout Card (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex flex-col gap-6"
          >
            <h2 className="text-sm font-black text-muted-foreground mb-4 px-2 uppercase tracking-[0.2em]">
              Account
            </h2>
            <div className="glass-card rounded-[2rem] p-8 border border-negative/10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-negative/5 flex items-center justify-center">
                <LogOut className="w-10 h-10 text-negative" />
              </div>
              <div>
                <h3 className="text-xl font-black">Session Control</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">Ready to sign out of SplitSmart?</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full h-14 rounded-2xl font-black shadow-lg shadow-negative/10"
              >
                Log out securely
              </Button>
              <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
                Version 1.0.0 (Premium)
              </p>
            </div>
          </motion.div>
        </div>

        {/* Logout Button (Mobile Only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:hidden mt-8"
        >
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full justify-start text-negative hover:text-negative hover:bg-negative/10 h-14 rounded-2xl"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log out
          </Button>
        </motion.div>

        {/* Version Info (Mobile Only) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="md:hidden text-center text-sm text-muted-foreground py-4"
        >
          <p>SplitSmart v1.0.0</p>
        </motion.div>
      </main>
    </div>
  )
}
