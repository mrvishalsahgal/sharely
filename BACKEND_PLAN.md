# SplitSmart — Full Backend Implementation Plan

> **Stack:** Next.js (App Router) · MongoDB Atlas · Mongoose · NextAuth.js (Auth.js v5) · TypeScript

---

## Phase Overview

| Phase | Focus | Outcome |
|---|---|---|
| 1 | Project Setup | MongoDB connected, environment configured |
| 2 | Authentication | Users can register, login, and maintain sessions |
| 3 | Database Models | All Mongoose schemas defined |
| 4 | Core API Routes | Groups, Expenses, Settlements |
| 5 | Balance Engine | Smart balance calculation logic |
| 6 | Real-time & Activity | Live updates, activity feed |
| 7 | Notifications | In-app and push notifications |
| 8 | Frontend Wiring | Replace mock data with real API calls |
| 9 | Security & Validation | Middleware, rate limiting, input validation |
| 10 | Deployment | Vercel + Atlas production setup |

---

## Phase 1 — Project Setup & MongoDB Connection

### Goals
- Connect Next.js to MongoDB Atlas
- Set up environment variables
- Install all required dependencies

### Steps

#### 1.1 Install Dependencies
```bash
npm install mongoose next-auth@beta bcryptjs
npm install --save-dev @types/bcryptjs
```

#### 1.2 Create MongoDB Atlas Cluster
1. Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free `M0` cluster
3. Add your IP address to the Network Access whitelist (or `0.0.0.0/0` for all IPs during development)
4. Create a database user and copy the connection string

#### 1.3 Environment Variables
Create a `.env.local` file in the root of the project:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/splitsmart?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

#### 1.4 MongoDB Connection Utility
**File:** `lib/mongodb.ts`

This file creates a cached connection so the app doesn't open a new database connection on every API request.

```typescript
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set')
}

let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
```

---

## Phase 2 — Authentication

### Goals
- User registration with email + password
- Login with email + password
- OAuth login (Google, GitHub)
- JWT sessions with user data

### 2.1 User Model (for Auth)
**File:** `lib/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash?: string
  avatar?: string
  phone?: string
  friends: mongoose.Types.ObjectId[]
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },
  avatar:       { type: String },
  phone:        { type: String },
  friends:      [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
```

### 2.2 NextAuth Configuration
**File:** `auth.ts` (root of project)

```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email: credentials?.email })
        if (!user || !user.passwordHash) return null
        const isValid = await bcrypt.compare(credentials?.password as string, user.passwordHash)
        if (!isValid) return null
        return { id: user._id.toString(), name: user.name, email: user.email }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

### 2.3 API Routes for Auth
**File:** `app/api/auth/[...nextauth]/route.ts`
```typescript
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

**File:** `app/api/auth/register/route.ts`
```typescript
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: Request) {
  const { name, email, password } = await request.json()
  await connectDB()

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash })

  return NextResponse.json({ id: user._id, name: user.name, email: user.email }, { status: 201 })
}
```

---

## Phase 3 — Database Models (Mongoose Schemas)

### Goals
- Define all 4 core collections in Mongoose
- Add proper indexing for performance

### 3.1 Group Model
**File:** `lib/models/Group.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IGroup extends Document {
  name: string
  emoji: string
  type: 'home' | 'trip' | 'event' | 'couple' | 'other'
  members: mongoose.Types.ObjectId[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
}

const GroupSchema = new Schema<IGroup>({
  name:      { type: String, required: true, trim: true },
  emoji:     { type: String, default: '📦' },
  type:      { type: String, enum: ['home', 'trip', 'event', 'couple', 'other'], default: 'other' },
  members:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

// Index for fast querying of groups by member
GroupSchema.index({ members: 1 })

export default mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema)
```

### 3.2 Expense Model
**File:** `lib/models/Expense.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

interface ISplit {
  user: mongoose.Types.ObjectId
  amountOwed: number
  hasSettled: boolean
}

export interface IExpense extends Document {
  title: string
  description?: string
  amount: number
  category: string
  groupId?: mongoose.Types.ObjectId
  paidBy: mongoose.Types.ObjectId
  splits: ISplit[]
  date: Date
  reactions: { emoji: string; user: mongoose.Types.ObjectId }[]
}

const SplitSchema = new Schema<ISplit>({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amountOwed:  { type: Number, required: true },
  hasSettled:  { type: Boolean, default: false },
})

const ExpenseSchema = new Schema<IExpense>({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  amount:      { type: Number, required: true, min: 0 },
  category:    { type: String, default: 'General' },
  groupId:     { type: Schema.Types.ObjectId, ref: 'Group' },
  paidBy:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  splits:      [SplitSchema],
  reactions:   [{ emoji: String, user: { type: Schema.Types.ObjectId, ref: 'User' } }],
}, { timestamps: true })

// Indexes for performance
ExpenseSchema.index({ groupId: 1, createdAt: -1 })
ExpenseSchema.index({ 'splits.user': 1 })
ExpenseSchema.index({ paidBy: 1 })

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema)
```

### 3.3 Settlement Model
**File:** `lib/models/Settlement.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface ISettlement extends Document {
  fromUser: mongoose.Types.ObjectId
  toUser: mongoose.Types.ObjectId
  amount: number
  method: 'cash' | 'venmo' | 'paypal' | 'bank'
  groupId?: mongoose.Types.ObjectId
  note?: string
  status: 'completed' | 'pending'
  createdAt: Date
}

const SettlementSchema = new Schema<ISettlement>({
  fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUser:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount:   { type: Number, required: true, min: 0 },
  method:   { type: String, enum: ['cash', 'venmo', 'paypal', 'bank'], default: 'cash' },
  groupId:  { type: Schema.Types.ObjectId, ref: 'Group' },
  note:     { type: String },
  status:   { type: String, enum: ['completed', 'pending'], default: 'completed' },
}, { timestamps: true })

SettlementSchema.index({ fromUser: 1, toUser: 1 })
SettlementSchema.index({ groupId: 1 })

export default mongoose.models.Settlement || mongoose.model<ISettlement>('Settlement', SettlementSchema)
```

### 3.4 Notification Model
**File:** `lib/models/Notification.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: 'expense_added' | 'settled_up' | 'group_invite' | 'friend_request' | 'reminder'
  message: string
  fromUser?: mongoose.Types.ObjectId
  relatedGroupId?: mongoose.Types.ObjectId
  relatedExpenseId?: mongoose.Types.ObjectId
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:              { type: String, required: true },
  message:           { type: String, required: true },
  fromUser:          { type: Schema.Types.ObjectId, ref: 'User' },
  relatedGroupId:    { type: Schema.Types.ObjectId, ref: 'Group' },
  relatedExpenseId:  { type: Schema.Types.ObjectId, ref: 'Expense' },
  isRead:            { type: Boolean, default: false },
}, { timestamps: true })

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
```

---

## Phase 4 — Core API Routes

### API Route Structure
```
app/api/
  auth/
    [...nextauth]/route.ts
    register/route.ts
  users/
    [id]/route.ts
    me/route.ts
    friends/route.ts
  groups/
    route.ts               # GET all, POST create
    [id]/
      route.ts             # GET, PATCH, DELETE
      members/route.ts     # POST add member, DELETE remove
      expenses/route.ts    # GET all expenses for a group
      balances/route.ts    # GET calculated balances
  expenses/
    route.ts               # POST create expense
    [id]/
      route.ts             # GET, PATCH, DELETE
      reactions/route.ts   # POST add reaction
  settlements/
    route.ts               # POST create settlement
    [id]/route.ts
  notifications/
    route.ts               # GET all for current user
    [id]/read/route.ts     # PATCH mark as read
```

### 4.1 Groups API
**File:** `app/api/groups/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Group from '@/lib/models/Group'

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

  const { name, emoji, type, memberIds } = await request.json()
  await connectDB()

  const group = await Group.create({
    name,
    emoji,
    type,
    members: [session.user.id, ...memberIds],
    createdBy: session.user.id,
  })

  return NextResponse.json(group, { status: 201 })
}
```

### 4.2 Expenses API
**File:** `app/api/expenses/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, amount, category, groupId, splitWith, splitType } = await request.json()
  await connectDB()

  // Calculate split amounts
  const allUsers = [session.user.id, ...splitWith]
  const perPersonAmount = amount / allUsers.length

  const splits = allUsers.map((userId: string) => ({
    user: userId,
    amountOwed: userId === session.user.id ? 0 : perPersonAmount,
    hasSettled: userId === session.user.id, // Payer doesn't owe themselves
  }))

  const expense = await Expense.create({
    title,
    amount,
    category,
    groupId,
    paidBy: session.user.id,
    splits,
  })

  return NextResponse.json(expense, { status: 201 })
}
```

---

## Phase 5 — Balance Calculation Engine

### Goals
- Calculate who owes who without storing redundant balance data
- Use MongoDB Aggregation Pipeline for efficiency

### 5.1 Balance Aggregation Logic
**File:** `lib/balances.ts`

```typescript
import { connectDB } from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import Settlement from '@/lib/models/Settlement'
import mongoose from 'mongoose'

export async function calculateUserBalances(userId: string) {
  await connectDB()
  const userObjId = new mongoose.Types.ObjectId(userId)

  // What other people owe the current user (they paid, others owe)
  const theyOweMe = await Expense.aggregate([
    { $match: { paidBy: userObjId } },
    { $unwind: '$splits' },
    { $match: { 'splits.user': { $ne: userObjId }, 'splits.hasSettled': false } },
    {
      $group: {
        _id: '$splits.user',
        totalOwed: { $sum: '$splits.amountOwed' },
      },
    },
  ])

  // What the current user owes others (others paid, user owes them)
  const iOweThem = await Expense.aggregate([
    { $match: { 'splits.user': userObjId, paidBy: { $ne: userObjId } } },
    { $unwind: '$splits' },
    { $match: { 'splits.user': userObjId, 'splits.hasSettled': false } },
    {
      $group: {
        _id: '$paidBy',
        totalOwed: { $sum: '$splits.amountOwed' },
      },
    },
  ])

  // Merge and net the balances
  const balanceMap: Record<string, number> = {}

  for (const item of theyOweMe) {
    balanceMap[item._id.toString()] = (balanceMap[item._id.toString()] || 0) + item.totalOwed
  }

  for (const item of iOweThem) {
    balanceMap[item._id.toString()] = (balanceMap[item._id.toString()] || 0) - item.totalOwed
  }

  return balanceMap // Positive = they owe you, Negative = you owe them
}
```

---

## Phase 6 — Activity Feed

### Goals
- Track all events (expense added, settled, group joined)
- Serve a real-time activity feed per user

### 6.1 Activity API
**File:** `app/api/activity/route.ts`

Aggregate recent expenses and settlements across all of the user's groups to create a combined activity feed, sorted by date.

```typescript
// Fetch last 50 activities merged from Expense + Settlement collections
// Return sorted by createdAt descending
```

---

## Phase 7 — Notifications

### Goals
- Create notifications when expenses are added to a group
- Notify users when someone settles up with them
- Mark notifications as read

### 7.1 Notification Triggers
Add notification creation logic in relevant API routes:
- `POST /api/expenses` → notify all group members
- `POST /api/settlements` → notify the user who was paid

### 7.2 Notifications API
**File:** `app/api/notifications/route.ts`

```typescript
// GET: return all unread notifications for session user
// PATCH /api/notifications/[id]/read: mark one as read
// PATCH /api/notifications/mark-all-read: mark all as read
```

---

## Phase 8 — Frontend Wiring

### Goals
- Remove all static `mock-data.ts` imports
- Connect every component to real API routes
- Add loading and error states

### 8.1 Data Fetching Pattern
Use **Server Components** for initial page data and **SWR** or **React Query** for client-side data that needs to refresh.

```bash
npm install swr
```

**Example for groups:**
```typescript
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function useGroups() {
  const { data, error, isLoading } = useSWR('/api/groups', fetcher)
  return { groups: data, error, isLoading }
}
```

### 8.2 Replace Mock Data in Order
1. `lib/mock-data.ts` → delete after all APIs are connected
2. `Dashboard` → connect to `/api/groups` and `/api/balances`
3. `GroupSpace` → connect to `/api/groups/[id]/expenses`
4. `SettleModal` → connect to `POST /api/settlements`
5. `CreateGroupView` → connect to `POST /api/groups`
6. `AddMembersView` → connect to `POST /api/groups/[id]/members`
7. `NotificationsView` → connect to `/api/notifications`
8. `ActivityView` → connect to `/api/activity`
9. `ProfileView` → connect to `/api/users/me`
10. `SettingsView` → connect to `PATCH /api/users/me`

---

## Phase 9 — Security & Validation

### Goals
- Validate all inputs using Zod
- Protect routes with auth middleware
- Rate-limit API routes
- Sanitize and escape user data

### 9.1 Input Validation with Zod
```bash
npm install zod
```

```typescript
import { z } from 'zod'

const CreateExpenseSchema = z.object({
  title:     z.string().min(1).max(100),
  amount:    z.number().positive().max(1_000_000),
  category:  z.string(),
  groupId:   z.string().optional(),
  splitWith: z.array(z.string()),
})
```

### 9.2 Rate Limiting
Use `@vercel/kv` or a simple in-memory map to rate limit sensitive endpoints like `/api/auth/register`.

### 9.3 Security Checklist
- [ ] All routes check for authenticated session first
- [ ] Users can only access groups they are a member of
- [ ] Users can only delete/edit their own expenses
- [ ] Amounts are always validated as positive numbers
- [ ] No raw `_id` exposed where it's not needed (use DTO/transform layers)

---

## Phase 10 — Deployment

### Goals
- Deploy frontend to Vercel
- Use MongoDB Atlas for production database
- Set all production environment variables

### 10.1 Vercel Deployment
1. Connect your GitHub repository to Vercel.
2. Set all environment variables from `.env.local` in the Vercel project settings.
3. Deploy!

### 10.2 Production Environment Variables
```env
MONGODB_URI=mongodb+srv://...  (Atlas production cluster)
NEXTAUTH_SECRET=...            (Generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 10.3 MongoDB Atlas Production Tips
- Enable **IP Access List** to only allow Vercel's IPs (or `0.0.0.0/0` for now)
- Enable **MongoDB Atlas Backups** (automated daily backups)
- Set up **Alerts** for high connection count or slow queries
- Enable **MongoDB Atlas Search** indexes if you want a global search feature later

---

## Folder Structure (Final)

```
split-smart/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── users/
│   │   │   ├── me/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── groups/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── members/route.ts
│   │   │       ├── expenses/route.ts
│   │   │       └── balances/route.ts
│   │   ├── expenses/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── settlements/
│   │   │   └── route.ts
│   │   ├── notifications/
│   │   │   └── route.ts
│   │   └── activity/
│   │       └── route.ts
│   └── (existing pages)
├── lib/
│   ├── mongodb.ts           # Database connection
│   ├── models/
│   │   ├── User.ts
│   │   ├── Group.ts
│   │   ├── Expense.ts
│   │   ├── Settlement.ts
│   │   └── Notification.ts
│   ├── balances.ts          # Balance calculation engine
│   ├── validations.ts       # Zod schemas
│   └── mock-data.ts         # DELETE in Phase 8
├── auth.ts                  # NextAuth config
├── middleware.ts            # Route protection
├── BACKEND_PLAN.md          # This file
└── .env.local
```

---

## Recommended Phase Execution Order

```
Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5
   ↓
Phase 8  →  Phase 6  →  Phase 7  →  Phase 9  →  Phase 10
```

> **Tip:** Complete Phase 1–5 before touching the frontend (Phase 8). This ensures your API is stable before you wire components to it.

---

*Document created: April 2026 | SplitSmart v1.0 Backend Roadmap*
