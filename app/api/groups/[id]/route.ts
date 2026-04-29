import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const group = await Group.findOne({ _id: id, members: session.user.id })
      .populate('members', 'name email avatar')

    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await connectDB()
    
    const group = await Group.findOneAndUpdate(
      { _id: id, members: session.user.id },
      { $set: body },
      { new: true }
    )

    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    // Add new members to current user's friends list if members were updated
    if (body.members && Array.isArray(body.members)) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { friends: { $each: body.members.filter((m: string) => m !== session.user.id) } }
      })
    }

    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
