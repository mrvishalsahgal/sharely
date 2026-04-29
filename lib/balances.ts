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

export async function calculateGroupSummaries(userId: string) {
  await connectDB()
  const userObjId = new mongoose.Types.ObjectId(userId)

  // 1. Get total expenses for each group
  const groupTotals = await Expense.aggregate([
    { $group: { _id: '$groupId', total: { $sum: '$amount' } } }
  ])

  // 2. Get user's balance for each group
  // This is more complex because calculateUserBalances is per-group
  // Let's do a simplified aggregation here for all groups
  
  // What others owe me (per group)
  const theyOweMe = await Expense.aggregate([
    { $match: { paidBy: userObjId } },
    { $unwind: '$splits' },
    { $match: { 'splits.user': { $ne: userObjId } } },
    { $group: { _id: '$groupId', amount: { $sum: '$splits.amountOwed' } } }
  ])

  // What I owe others (per group)
  const iOweThem = await Expense.aggregate([
    { $match: { 'splits.user': userObjId, paidBy: { $ne: userObjId } } },
    { $unwind: '$splits' },
    { $match: { 'splits.user': userObjId } },
    { $group: { _id: '$groupId', amount: { $sum: '$splits.amountOwed' } } }
  ])

  // Settlements received (per group)
  const settlementsReceived = await Settlement.aggregate([
    { $match: { toUser: userObjId, status: 'completed' } },
    { $group: { _id: '$groupId', amount: { $sum: '$amount' } } }
  ])

  // Settlements paid (per group)
  const settlementsPaid = await Settlement.aggregate([
    { $match: { fromUser: userObjId, status: 'completed' } },
    { $group: { _id: '$groupId', amount: { $sum: '$amount' } } }
  ])

  const summaries: Record<string, { totalExpenses: number; userBalance: number }> = {}

  groupTotals.forEach(item => {
    const gid = item._id?.toString() || 'personal'
    summaries[gid] = { totalExpenses: item.total, userBalance: 0 }
  })

  theyOweMe.forEach(item => {
    const gid = item._id?.toString() || 'personal'
    if (!summaries[gid]) summaries[gid] = { totalExpenses: 0, userBalance: 0 }
    summaries[gid].userBalance += item.amount
  })

  iOweThem.forEach(item => {
    const gid = item._id?.toString() || 'personal'
    if (!summaries[gid]) summaries[gid] = { totalExpenses: 0, userBalance: 0 }
    summaries[gid].userBalance -= item.amount
  })

  settlementsReceived.forEach(item => {
    const gid = item._id?.toString() || 'personal'
    if (!summaries[gid]) summaries[gid] = { totalExpenses: 0, userBalance: 0 }
    summaries[gid].userBalance -= item.amount
  })

  settlementsPaid.forEach(item => {
    const gid = item._id?.toString() || 'personal'
    if (!summaries[gid]) summaries[gid] = { totalExpenses: 0, userBalance: 0 }
    summaries[gid].userBalance += item.amount
  })

  return summaries
}
