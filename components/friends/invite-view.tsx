"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  X,
  Loader2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InviteViewProps {
  onBack: () => void
  groupId?: string
  type?: 'friend' | 'group'
}

export function InviteView({ onBack, groupId, type = 'friend' }: InviteViewProps) {
  const [inviteMethod, setInviteMethod] = useState<"email" | "phone" | "link">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  const handleSendInvite = async () => {
    setIsSending(true)
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: groupId ? 'group' : type,
          targetId: groupId,
          email: inviteMethod === 'email' ? email : undefined,
          phone: inviteMethod === 'phone' ? phone : undefined,
        })
      })

      if (!response.ok) throw new Error('Failed to create invite')

      const data = await response.json()
      setInviteLink(data.inviteLink)
      setInviteSent(true)
    } catch (error) {
      console.error('Invite error:', error)
    } finally {
      setIsSending(false)
    }
  }

  const copyInviteLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleGenerateLink = async () => {
    setIsSending(true)
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: groupId ? 'group' : type,
          targetId: groupId
        })
      })
      const data = await response.json()
      setInviteLink(data.inviteLink)
    } catch (error) {
      console.error('Link generation error:', error)
    } finally {
      setIsSending(false)
    }
  }

  const methods = [
    { id: "email" as const, icon: Mail, label: "Email" },
    { id: "phone" as const, icon: Phone, label: "SMS" },
    { id: "link" as const, icon: LinkIcon, label: "Link" },
  ]

  if (inviteSent) {
    return (
      <div className="flex flex-col flex-1 bg-background">
        <header className="p-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:hidden" />
          </button>
          <button
            onClick={onBack}
            className="hidden md:flex p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 md:p-8 md:pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-positive/20 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-positive" />
            </motion.div>

            <h1 className="text-2xl font-bold md:font-black mb-2 tracking-tight">Invite Sent!</h1>
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
                className="w-full h-12 md:rounded-xl font-bold"
              >
                Invite Another Friend
              </Button>
              <Button variant="outline" className="w-full h-12 md:rounded-xl font-bold" onClick={onBack}>
                Done
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 md:border-none md:bg-transparent">
        <div className="flex items-center justify-between p-4 md:p-8 md:pb-4 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-2xl font-semibold md:font-black tracking-tight">Invite Friend</h1>
          </div>
          <button
            onClick={onBack}
            className="hidden md:flex p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4 md:p-8 pt-2 space-y-6 md:space-y-8">
        {/* Method Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-card md:bg-secondary/30 rounded-xl md:rounded-2xl">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setInviteMethod(method.id)}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg md:rounded-xl transition-all font-medium md:font-bold text-sm ${
                inviteMethod === method.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <method.icon className="w-4 h-4" />
              <span>{method.label}</span>
            </button>
          ))}
        </div>

        {/* Invite Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={inviteMethod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 md:space-y-6"
          >
            {inviteMethod === "email" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm md:text-xs font-medium md:font-black md:uppercase md:tracking-[0.2em] md:text-muted-foreground px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="friend@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 md:pl-12 h-12 md:h-14 bg-card border-border md:border-2 md:border-border/50 md:rounded-2xl font-medium md:font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSendInvite}
                  disabled={!email || isSending}
                  className="w-full h-12 md:h-14 md:rounded-2xl font-bold md:font-black md:text-lg shadow-xl shadow-primary/20"
                >
                  {isSending ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : "Send Invite"}
                </Button>
              </div>
            )}

            {inviteMethod === "phone" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm md:text-xs font-medium md:font-black md:uppercase md:tracking-[0.2em] md:text-muted-foreground px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 md:pl-12 h-12 md:h-14 bg-card border-border md:border-2 md:border-border/50 md:rounded-2xl font-medium md:font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSendInvite}
                  disabled={!phone || isSending}
                  className="w-full h-12 md:h-14 md:rounded-2xl font-bold md:font-black md:text-lg shadow-xl shadow-primary/20"
                >
                  {isSending ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : "Send SMS Invite"}
                </Button>
              </div>
            )}

            {inviteMethod === "link" && (
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  <label className="text-sm md:text-xs font-medium md:font-black md:uppercase md:tracking-[0.2em] md:text-muted-foreground px-1">Your Invite Link</label>
                  {!inviteLink ? (
                    <Button 
                      onClick={handleGenerateLink} 
                      disabled={isSending}
                      className="w-full h-12 md:h-14 md:rounded-2xl font-bold md:font-black md:text-lg md:bg-primary/10 md:text-primary md:hover:bg-primary/20 md:border-2 md:border-dashed md:border-primary/30 transition-all"
                    >
                      {isSending ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : "Generate Invite Link"}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={inviteLink}
                        readOnly
                        className="h-12 md:h-14 bg-card border-border md:border-2 md:border-border/50 md:rounded-2xl font-mono text-sm px-4 md:px-6"
                      />
                      <Button
                        variant="secondary"
                        className="h-12 md:h-14 w-12 md:w-14 md:rounded-2xl shrink-0"
                        onClick={copyInviteLink}
                      >
                        {linkCopied ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Copy className="w-4 h-4 md:w-5 md:h-5" />}
                      </Button>
                    </div>
                  )}
                </div>

                {inviteLink && (
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <Button 
                      variant="outline" 
                      className="h-12 md:h-14 md:rounded-2xl font-bold md:border-2"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Join me on Sharely',
                            text: 'Hey! Join me on Sharely to split expenses easily.',
                            url: inviteLink,
                          })
                        } else {
                          copyInviteLink()
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 md:h-14 md:rounded-2xl font-bold md:border-2"
                      onClick={copyInviteLink}
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Benefits */}
        <div className="bg-card md:bg-secondary/20 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border md:border-border/50">
          <h3 className="font-medium md:font-black text-sm mb-3 md:mb-4 md:uppercase md:tracking-widest md:text-muted-foreground">Why Sharely?</h3>
          <ul className="md:hidden space-y-2 text-sm text-muted-foreground">
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
          <div className="hidden md:flex md:flex-col space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Sharely Tracking</p>
                <p className="text-xs text-muted-foreground font-medium">Split expenses with anyone instantly.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Real-time Balance</p>
                <p className="text-xs text-muted-foreground font-medium">Know exactly who owes what at all times.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
