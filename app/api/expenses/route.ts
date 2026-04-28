import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import Notification from '@/lib/models/Notification'
import { expenseSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = expenseSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 })
    }

    const { title, amount, category, groupId, splitWith } = result.data
    await connectDB()

    const userId = session.user.id
    const userName = session.user.name || 'User'

    // Calculate split amounts (simple equal split for now)
    const allUsers = Array.from(new Set([userId, ...(splitWith || [])]))
    const perPersonAmount = amount / allUsers.length

    const splits = allUsers.map((id: string) => ({
      user: id,
      amountOwed: id === userId ? 0 : perPersonAmount,
      hasSettled: id === userId,
    }))

    const expense = await Expense.create({
      title,
      description: title,
      amount,
      category,
      groupId,
      paidBy: userId,
      splits,
    })

    const otherUsers = allUsers.filter(id => id !== userId)
    if (otherUsers.length > 0) {
      await Notification.insertMany(otherUsers.map(id => ({
        userId: id,
        type: 'expense_added',
        message: `${userName} added "${title}"`,
        fromUser: userId,
        relatedGroupId: groupId,
        relatedExpenseId: expense._id,
      })))
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
