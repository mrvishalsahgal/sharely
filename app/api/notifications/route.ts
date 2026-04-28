import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  try {
    await connectDB()
    const query: any = { userId: session.user.id }
    if (unreadOnly) query.isRead = false

    const notifications = await Notification.find(query)
      .populate('fromUser', 'name avatar')
      .populate('relatedGroupId', 'name emoji')
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, isRead } = await request.json()
    await connectDB()
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { isRead: isRead ?? true } },
      { new: true }
    )

    if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
