import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'
import { groupSchema } from '@/lib/validations'
import { calculateGroupSummaries } from '@/lib/balances'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const groups = await Group.find({ members: session.user.id })
    .populate('members', 'name email avatar color')
    .sort({ updatedAt: -1 })

  const summaries = await calculateGroupSummaries(session.user.id)

  const enrichedGroups = groups.map(group => {
    const summary = summaries[group._id.toString()] || { totalExpenses: 0, userBalance: 0 }
    return {
      ...group.toObject(),
      id: group._id.toString(),
      totalExpenses: summary.totalExpenses,
      userBalance: summary.userBalance
    }
  })

  return NextResponse.json(enrichedGroups)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = groupSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 })
    }

    const { name, emoji, type, memberIds } = result.data
    await connectDB()

    const group = await Group.create({
      name,
      emoji,
      type,
      members: Array.from(new Set([session.user.id, ...(memberIds || [])])),
      createdBy: session.user.id,
    })

    // Add members to creator's friends list
    if (memberIds && memberIds.length > 0) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { friends: { $each: memberIds } }
      })
    }

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
