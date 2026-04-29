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

    const { title, amount, category, groupId, splitWith, splits: customSplits } = result.data
    await connectDB()

    const userId = session.user.id
    const userName = session.user.name || 'User'

    let finalSplits = []

    if (customSplits && customSplits.length > 0) {
      // Use custom splits
      finalSplits = customSplits.map((s: any) => ({
        user: s.userId,
        amountOwed: s.userId === userId ? 0 : s.amount,
        hasSettled: s.userId === userId,
      }))
    } else {
      // Calculate split amounts (equal split)
      const splitUsers = Array.from(new Set(splitWith || []))
      const perPersonAmount = splitUsers.length > 0 ? amount / splitUsers.length : amount

      finalSplits = splitUsers.map((id: string) => ({
        user: id,
        amountOwed: perPersonAmount,
        hasSettled: id === userId,
      }))
    }

    // Always ensure the payer is in the splits with amountOwed 0 if they're not already there
    // This marks them as the one who paid.
    if (!finalSplits.some(s => s.user.toString() === userId)) {
      finalSplits.push({
        user: userId,
        amountOwed: 0,
        hasSettled: true
      })
    }

    const expense = await Expense.create({
      title,
      description: title,
      amount,
      category,
      groupId,
      paidBy: userId,
      splits: finalSplits,
    })

    const otherUserIds = finalSplits
      .map(s => s.user.toString())
      .filter(id => id !== userId)

    if (otherUserIds.length > 0) {
      await Notification.insertMany(otherUserIds.map(id => ({
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
