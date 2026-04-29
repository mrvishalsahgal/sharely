import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Settlement from '@/lib/models/Settlement'
import Notification from '@/lib/models/Notification'
import { settlementSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = settlementSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 })
    }

    const { toUser, amount, method, groupId, note, isReminder } = result.data
    await connectDB()

    if (isReminder) {
      // Only create a notification for reminders
      await Notification.create({
        userId: toUser,
        type: 'reminder',
        message: `${session.user.name} reminded you about $${(amount ?? 0).toFixed(2)}`,
        fromUser: session.user.id,
        relatedGroupId: groupId,
      })
      return NextResponse.json({ success: true, message: 'Reminder sent' })
    }

    const settlement = await Settlement.create({
      fromUser: session.user.id,
      toUser,
      amount,
      method,
      groupId,
      note,
      status: 'completed',
    })

    // Notify the receiver of actual settlement
    await Notification.create({
      userId: toUser,
      type: 'settled_up',
      message: `${session.user.name} settled up $${(amount ?? 0).toFixed(2)} with you`,
      fromUser: session.user.id,
      relatedGroupId: groupId,
    })

    return NextResponse.json(settlement, { status: 201 })
  } catch (error) {
    console.error('Error creating settlement:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
