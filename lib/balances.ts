import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import Settlement from '@/lib/models/Settlement'
import mongoose from 'mongoose'

/**
 * Calculates net balances for a user across all groups or a specific group.
 * Positive balance = others owe you.
 * Negative balance = you owe others.
 */
export async function calculateUserBalances(userId: string, groupId?: string) {
  await connectDB()
  const userObjId = new mongoose.Types.ObjectId(userId)
  const groupMatch = groupId ? { groupId: new mongoose.Types.ObjectId(groupId) } : {}

  // 1. What others owe me (I paid, others in splits)
  const theyOweMe = await Expense.aggregate([
    { $match: { paidBy: userObjId, ...groupMatch } },
    { $unwind: '$splits' },
    { $match: { 'splits.user': { $ne: userObjId } } },
    {
      $group: {
        _id: '$splits.user',
        total: { $sum: '$splits.amountOwed' },
      },
    },
  ])

  // 2. What I owe others (Others paid, I am in splits)
  const iOweThem = await Expense.aggregate([
    { $match: { 'splits.user': userObjId, paidBy: { $ne: userObjId }, ...groupMatch } },
    { $unwind: '$splits' },
    { $match: { 'splits.user': userObjId } },
    {
      $group: {
        _id: '$paidBy',
        total: { $sum: '$splits.amountOwed' },
      },
    },
  ])

  // 3. Settlements I received (Others paid me back)
  const settlementsReceived = await Settlement.aggregate([
    { $match: { toUser: userObjId, status: 'completed', ...groupMatch } },
    {
      $group: {
        _id: '$fromUser',
        total: { $sum: '$amount' },
      },
    },
  ])

  // 4. Settlements I paid (I paid others back)
  const settlementsPaid = await Settlement.aggregate([
    { $match: { fromUser: userObjId, status: 'completed', ...groupMatch } },
    {
      $group: {
        _id: '$toUser',
        total: { $sum: '$amount' },
      },
    },
  ])

  // Net the results
  const balances: Record<string, number> = {}

  theyOweMe.forEach(item => {
    const id = item._id.toString()
    balances[id] = (balances[id] || 0) + item.total
  })

  iOweThem.forEach(item => {
    const id = item._id.toString()
    balances[id] = (balances[id] || 0) - item.total
  })

  settlementsReceived.forEach(item => {
    const id = item._id.toString()
    balances[id] = (balances[id] || 0) - item.total // Reduces what they owe me
  })

  settlementsPaid.forEach(item => {
    const id = item._id.toString()
    balances[id] = (balances[id] || 0) + item.total // Reduces what I owe them
  })

  return balances
}
