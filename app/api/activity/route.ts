import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import Settlement from '@/lib/models/Settlement'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const userId = session.user.id

    // Fetch recent expenses where user is involved
    const expenses = await Expense.find({
      $or: [
        { paidBy: userId },
        { 'splits.user': userId }
      ]
    })
    .populate('paidBy', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(skip + limit)
    .lean()

    // Fetch recent settlements where user is involved
    const settlements = await Settlement.find({
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    })
    .populate('fromUser', 'name avatar')
    .populate('toUser', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(skip + limit)
    .lean()

    // Combine and format
    const allActivities = [
      ...expenses.map((e: any) => ({
        id: e._id,
        type: 'expense',
        title: e.title,
        amount: e.amount,
        paidBy: e.paidBy,
        date: e.createdAt,
        category: e.category,
      })),
      ...settlements.map((s: any) => ({
        id: s._id,
        type: 'settlement',
        amount: s.amount,
        fromUser: s.fromUser,
        toUser: s.toUser,
        date: s.createdAt,
        method: s.method,
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Apply proper pagination slice
    const paginatedActivities = allActivities.slice(skip, skip + limit)

    return NextResponse.json(paginatedActivities)
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
