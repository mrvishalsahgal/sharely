import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Invite from '@/lib/models/Invite'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, targetId, email, phone } = await request.json()
    
    await connectDB()

    // Generate a unique short code
    const code = uuidv4().substring(0, 8)
    
    // Set expiration (e.g., 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await Invite.create({
      code,
      inviterId: session.user.id,
      type: type || 'friend',
      targetId,
      email,
      phone,
      expiresAt
    })

    return NextResponse.json({ 
      code, 
      inviteLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/join/${code}` 
    }, { status: 201 })
  } catch (error) {
    console.error('Create invite error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
