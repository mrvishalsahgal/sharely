import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import { groupSchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const groups = await Group.find({ members: session.user.id })
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 })

  return NextResponse.json(groups)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = groupSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 })
    }

    const { name, emoji, type, memberIds } = result.data
    await connectDB()

    const group = await Group.create({
      name,
      emoji,
      type,
      members: Array.from(new Set([session.user.id, ...(memberIds || [])])),
      createdBy: session.user.id,
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
