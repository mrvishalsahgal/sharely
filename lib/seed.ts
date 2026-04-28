import { connectDB } from './mongodb'
import User from './models/User'
import bcrypt from 'bcryptjs'

async function seedUsers() {
  await connectDB()
  
  const testUsers = [
    { name: 'Alex Chen', email: 'alex@example.com', color: 'bg-chart-1' },
    { name: 'Sarah Kim', email: 'sarah@example.com', color: 'bg-chart-2' },
    { name: 'Mike Ross', email: 'mike@example.com', color: 'bg-chart-3' },
    { name: 'Emma Davis', email: 'emma@example.com', color: 'bg-chart-4' },
  ]

  console.log('Seeding users...')

  for (const userData of testUsers) {
    const exists = await User.findOne({ email: userData.email })
    if (!exists) {
      const hashedPassword = await bcrypt.hash('password123', 10)
      await User.create({
        ...userData,
        password: hashedPassword
      })
      console.log(`Created user: ${userData.name}`)
    } else {
      console.log(`User already exists: ${userData.name}`)
    }
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seedUsers().catch(err => {
  console.error(err)
  process.exit(1)
})
