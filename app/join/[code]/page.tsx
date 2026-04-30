"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Check, UserPlus, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    fetchInvite()
  }, [code])

  const fetchInvite = async () => {
    try {
      const res = await fetch(`/api/invites/${code}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Invite not found")
      }
      const data = await res.json()
      setInvite(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/join/${code}`)
      return
    }

    setAccepting(true)
    try {
      const res = await fetch(`/api/invites/${code}`, {
        method: 'POST'
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to accept invite")
      }
      setAccepted(true)
      setTimeout(() => {
        const redirectUrl = invite.type === 'group' 
          ? `/?joinedGroup=${invite.targetId._id}` 
          : '/?view=people'
        router.push(redirectUrl)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-16 h-16 rounded-full bg-negative/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-negative" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Oops!</h1>
        <p className="text-muted-foreground text-center mb-8">{error}</p>
        <Button asChild variant="outline">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-positive/20 flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-positive" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
        <p className="text-muted-foreground text-center mb-8">
          You've successfully joined. Redirecting you now...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-3xl p-8 border border-border shadow-xl text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
            {invite.inviterId.name[0]}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background flex items-center justify-center border-2 border-card">
            <UserPlus className="w-4 h-4 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Invitation</h1>
        <p className="text-muted-foreground mb-8">
          <span className="font-semibold text-foreground">{invite.inviterId.name}</span> invited you to join 
          {invite.type === 'group' ? (
            <> the group <span className="font-semibold text-foreground">{invite.targetId.name}</span></>
          ) : (
            <> them on Sharely</>
          )}
        </p>

        <div className="space-y-4">
          <Button 
            onClick={handleAccept} 
            className="w-full h-12 text-base font-semibold"
            disabled={accepting}
          >
            {accepting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : session ? (
              "Accept Invitation"
            ) : (
              <>
                Sign in to Accept
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          {!session && (
            <p className="text-xs text-muted-foreground">
              Don't have an account? <Link href={`/signup?callbackUrl=/join/${code}`} className="text-primary hover:underline font-medium">Sign up instead</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
