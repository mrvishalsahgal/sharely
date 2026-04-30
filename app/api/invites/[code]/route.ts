import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Invite from '@/lib/models/Invite'
import User from '@/lib/models/User'
import Group from '@/lib/models/Group'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  try {
    await connectDB()
    const invite = await Invite.findOne({ code })
      .populate('inviterId', 'name avatar color')
      .populate('targetId', 'name emoji')

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
    }

    if (invite.status === 'accepted') {
      return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
    }

    return NextResponse.json(invite)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const invite = await Invite.findOne({ code })
    
    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    if (new Date() > invite.expiresAt) return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
    if (invite.status === 'accepted') return NextResponse.json({ error: 'Invite already used' }, { status: 400 })

    if (invite.type === 'friend') {
      // Add friend to both users
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { friends: invite.inviterId }
      })
      await User.findByIdAndUpdate(invite.inviterId, {
        $addToSet: { friends: session.user.id }
      })
    } else if (invite.type === 'group' && invite.targetId) {
      // Add user to group
      await Group.findByIdAndUpdate(invite.targetId, {
        $addToSet: { members: session.user.id }
      })
      // Also add inviter as friend if not already
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { friends: invite.inviterId }
      })
      await User.findByIdAndUpdate(invite.inviterId, {
        $addToSet: { friends: session.user.id }
      })
    }

    // Mark invite as accepted
    invite.status = 'accepted'
    await invite.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
