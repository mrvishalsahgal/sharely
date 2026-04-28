"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Mail,
  Phone,
  Link as LinkIcon,
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function InviteFriendPage() {
  const router = useRouter()
  const [inviteMethod, setInviteMethod] = useState<"email" | "phone" | "link">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  const inviteLink = "https://splitsmart.app/join/abc123"

  const handleSendInvite = async () => {
    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSending(false)
    setInviteSent(true)
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const methods = [
    { id: "email" as const, icon: Mail, label: "Email" },
    { id: "phone" as const, icon: Phone, label: "SMS" },
    { id: "link" as const, icon: LinkIcon, label: "Link" },
  ]

  if (inviteSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-positive/20 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-positive" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Invite Sent!</h1>
            <p className="text-muted-foreground mb-8">
              {inviteMethod === "email"
                ? `We've sent an invite to ${email}`
                : inviteMethod === "phone"
                ? `We've sent an SMS to ${phone}`
                : "Your invite link is ready to share"}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setInviteSent(false)
                  setEmail("")
                  setPhone("")
                }}
                className="w-full"
              >
                Invite Another Friend
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.back()}>
                Done
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4 max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Invite Friend</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-6">
        {/* Method Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 p-1 bg-card rounded-xl"
        >
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setInviteMethod(method.id)}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                inviteMethod === method.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <method.icon className="w-4 h-4" />
              <span className="font-medium">{method.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Invite Form */}
        <motion.div
          key={inviteMethod}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {inviteMethod === "email" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                  />
                </div>
              </div>
              <Button
                onClick={handleSendInvite}
                disabled={!email || isSending}
                className="w-full h-12"
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </>
          )}

          {inviteMethod === "phone" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                  />
                </div>
              </div>
              <Button
                onClick={handleSendInvite}
                disabled={!phone || isSending}
                className="w-full h-12"
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send SMS Invite
                  </>
                )}
              </Button>
            </>
          )}

          {inviteMethod === "link" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Invite Link</label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="h-12 bg-card border-border font-mono text-sm"
                  />
                  <Button
                    variant="secondary"
                    className="h-12 px-4"
                    onClick={copyInviteLink}
                  >
                    {linkCopied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={copyInviteLink}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <h3 className="font-medium mb-3">Why invite friends?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Split expenses easily with anyone
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Track who owes what in real-time
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Settle up with just a tap
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  )
}
