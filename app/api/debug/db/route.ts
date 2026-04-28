import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import Group from '@/lib/models/Group'

export async function GET() {
  try {
    await connectDB()
    
    const userCount = await User.countDocuments()
    const groupCount = await Group.countDocuments()
    
    return NextResponse.json({
      status: 'connected',
      database: 'MongoDB Atlas',
      stats: {
        users: userCount,
        groups: groupCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
