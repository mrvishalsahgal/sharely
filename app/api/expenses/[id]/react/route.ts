import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: expenseId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { emoji } = await request.json()
    await connectDB()

    const userId = session.user.id
    const expense = await Expense.findById(expenseId)

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if the user already reacted with this emoji
    const existingReactionIndex = expense.reactions.findIndex(
      (r: any) => r.emoji === emoji && r.user.toString() === userId
    )

    if (existingReactionIndex > -1) {
      // Remove reaction if it exists (toggle)
      expense.reactions.splice(existingReactionIndex, 1)
    } else {
      // Add reaction
      expense.reactions.push({ emoji, user: userId })
    }

    await expense.save()
    return NextResponse.json(expense)
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
