import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import Group from '@/lib/models/Group'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    
    // Verify membership
    const group = await Group.findOne({ _id: id, members: session.user.id })
    if (!group) return NextResponse.json({ error: 'Unauthorized or Group not found' }, { status: 404 })

    const expenses = await Expense.find({ groupId: id })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .sort({ createdAt: -1 })

    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
