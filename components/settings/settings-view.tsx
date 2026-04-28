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
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
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

      <main className="max-w-lg w-full mx-auto p-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {section.title}
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {section.items.map((item, index) => (
                <div key={item.label}>
                  {index > 0 && <div className="h-px bg-border mx-4" />}
                  {item.type === "toggle" ? (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                      />
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-negative hover:text-negative hover:bg-negative/10 h-14 rounded-2xl"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log out
          </Button>
        </motion.div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground py-4"
        >
          <p>SplitSmart v1.0.0</p>
        </motion.div>
      </main>
    </div>
  )
}
