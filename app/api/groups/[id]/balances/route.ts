import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { calculateUserBalances } from '@/lib/balances'
import User from '@/lib/models/User'
import Group from '@/lib/models/Group'
import { connectDB } from '@/lib/mongodb'

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
    if (!group) return NextResponse.json({ error: 'Unauthorized or Group not found' }, { status: 404 })

    const balances = await calculateUserBalances(session.user.id, id)
    
    // Enrich with user data
    const userIds = Object.keys(balances)
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar email color')

    const enrichedBalances = users.map(user => ({
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        color: (user as any).color || 'bg-primary',
      },
      amount: balances[user._id.toString()]
    })).filter(b => Math.abs(b.amount) > 0.01)

    return NextResponse.json(enrichedBalances)
  } catch (error) {
    console.error('Error fetching group balances:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
