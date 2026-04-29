import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const user = await User.findById(session.user.id).populate('friends', 'name email avatar color')
    return NextResponse.json(user?.friends || [])
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    await connectDB()
    
    // Check if user exists
    const userToFriend = await User.findById(userId)
    if (!userToFriend) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Add to friends list
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { friends: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
