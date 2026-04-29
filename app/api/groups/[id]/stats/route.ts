import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    
    // Aggregate expenses by category
    const categoryStats = await Expense.aggregate([
      { $match: { groupId: new (require('mongoose').Types.ObjectId)(groupId) } },
      { $group: { 
          _id: '$category', 
          amount: { $sum: '$amount' } 
      } }
    ])

    const totalSpent = categoryStats.reduce((sum, cat) => sum + cat.amount, 0)

    const formattedStats = categoryStats.map(cat => ({
      name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
      amount: cat.amount,
      percent: totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0,
      color: getCategoryColor(cat._id)
    })).sort((a, b) => b.amount - a.amount)

    return NextResponse.json({
      totalSpent,
      categories: formattedStats
    })
  } catch (error) {
    console.error('Group stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    food: 'bg-chart-1',
    drinks: 'bg-chart-1',
    utilities: 'bg-chart-2',
    entertainment: 'bg-chart-3',
    transport: 'bg-chart-4',
    other: 'bg-chart-5',
    shopping: 'bg-chart-2',
    groceries: 'bg-chart-1',
  }
  return colors[category.toLowerCase()] || 'bg-chart-5'
}
