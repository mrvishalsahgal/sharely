import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import Settlement from '@/lib/models/Settlement'
import User from '@/lib/models/User'
import mongoose from 'mongoose'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = new mongoose.Types.ObjectId(session.user.id)
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)

  try {
    await connectDB()

    // 1. Get all expenses in the last 7 days where user is involved
    const expenses = await Expense.find({
      $or: [
        { paidBy: userId },
        { 'splits.user': userId }
      ],
      createdAt: { $gte: lastWeek }
    }).populate('paidBy', 'name')

    let totalSpent = 0
    let totalOwed = 0
    let totalOwing = 0
    let expenseCount = expenses.length

    expenses.forEach(exp => {
      if (exp.paidBy._id.toString() === userId.toString()) {
        // User paid
        const mySplit = exp.splits.find((s: any) => s.user.toString() === userId.toString())
        const othersOwe = exp.amount - (mySplit?.amountOwed || 0)
        totalSpent += exp.amount
        totalOwed += othersOwe
      } else {
        // Someone else paid
        const mySplit = exp.splits.find((s: any) => s.user.toString() === userId.toString())
        totalOwing += (mySplit?.amountOwed || 0)
      }
    })

    // 2. Settlement stats
    const settlements = await Settlement.find({
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ],
      createdAt: { $gte: lastWeek },
      status: 'completed'
    })

    const settledCount = settlements.length

    // 3. Biggest Spender & Most Generous (Simple logic for now)
    // Most generous = user who paid for most expenses you were part of (other than you)
    const payersMap = new Map<string, { name: string, count: number, amount: number }>()
    expenses.forEach(exp => {
      const pId = exp.paidBy._id.toString()
      const pName = exp.paidBy.name
      const current = payersMap.get(pId) || { name: pName, count: 0, amount: 0 }
      current.count += 1
      current.amount += exp.amount
      payersMap.set(pId, current)
    })

    let biggestSpender = { name: 'You', amount: 0 }
    let mostGenerous = { name: 'None', count: 0 }

    payersMap.forEach((data, id) => {
      if (data.amount > biggestSpender.amount) {
        biggestSpender = { name: id === userId.toString() ? 'You' : data.name, amount: data.amount }
      }
      if (id !== userId.toString() && data.count > mostGenerous.count) {
        mostGenerous = { name: data.name, count: data.count }
      }
    })

    return NextResponse.json({
      totalSpent,
      totalOwed,
      totalOwing,
      expenseCount,
      settledCount,
      biggestSpender,
      mostGenerous
    })
  } catch (error) {
    console.error('Weekly summary error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
