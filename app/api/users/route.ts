import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  try {
    await connectDB()
    
    if (query) {
      const filter: any = { 
        _id: { $ne: session.user.id },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }
      const users = await User.find(filter).limit(10).select('name email avatar color')
      return NextResponse.json(users)
    } else {
      const currentUser = await User.findById(session.user.id).populate('friends', 'name email avatar color')
      return NextResponse.json(currentUser?.friends || [])
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
