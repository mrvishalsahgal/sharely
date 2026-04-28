import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { calculateUserBalances } from '@/lib/balances'
import User from '@/lib/models/User'
import { connectDB } from '@/lib/mongodb'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const balances = await calculateUserBalances(session.user.id)
    
    // Enrich with user data
    await connectDB()
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
    })).filter(b => Math.abs(b.amount) > 0.01) // Filter out settled balances

    return NextResponse.json(enrichedBalances)
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
