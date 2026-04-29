import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: friendId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUserId = session.user.id

  try {
    await connectDB()
    
    // Find expenses where:
    // 1. Current user is payer AND friend is in splits
    // 2. Friend is payer AND current user is in splits
    // 3. (Optional but good) Both are in splits of a group expense
    
    const expenses = await Expense.find({
      $or: [
        { paidBy: currentUserId, 'splits.user': friendId },
        { paidBy: friendId, 'splits.user': currentUserId }
      ]
    })
    .populate('paidBy', 'name email avatar color')
    .populate('splits.user', 'name email avatar color')
    .sort({ createdAt: -1 })
    .limit(20)

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching shared expenses:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
