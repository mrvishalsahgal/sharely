import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Group from '@/lib/models/Group'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const userId = session.user.id

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Remove user from members
    group.members = group.members.filter((m: any) => m.toString() !== userId)
    
    // If no members left, maybe delete the group? 
    // For now just save.
    await group.save()

    return NextResponse.json({ message: 'Left group successfully' })
  } catch (error) {
    console.error('Leave group error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
