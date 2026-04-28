import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    await connectDB()
    
    const testUsers = [
      { name: 'Alex Chen', email: 'alex@example.com', color: 'bg-chart-1' },
      { name: 'Sarah Kim', email: 'sarah@example.com', color: 'bg-chart-2' },
      { name: 'Mike Ross', email: 'mike@example.com', color: 'bg-chart-3' },
      { name: 'Emma Davis', email: 'emma@example.com', color: 'bg-chart-4' },
    ]

    const results = []
    for (const userData of testUsers) {
      const exists = await User.findOne({ email: userData.email })
      if (!exists) {
        const hashedPassword = await bcrypt.hash('password123', 10)
        await User.create({
          ...userData,
          password: hashedPassword
        })
        results.push(`Created: ${userData.name}`)
      } else {
        results.push(`Skipped: ${userData.name} (exists)`)
      }
    }

    return NextResponse.json({ message: 'Seeding complete', results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
