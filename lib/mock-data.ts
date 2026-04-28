export interface User {
  id: string
  name: string
  avatar: string
  color: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: User
  splitWith: { user: User; amount: number; settled: boolean }[]
  category: string
  emoji: string
  timestamp: Date
  reactions: { emoji: string; users: User[] }[]
}

export interface Group {
  id: string
  name: string
  emoji: string
  members: User[]
  totalExpenses: number
  yourBalance: number
}

export interface Balance {
  user: User
  amount: number // positive = they owe you, negative = you owe them
}

export const currentUser: User = {
  id: 'current',
  name: 'You',
  avatar: '/avatars/you.png',
  color: 'bg-primary'
}

export const users: User[] = [
  currentUser,
  { id: '1', name: 'Alex Chen', avatar: '', color: 'bg-chart-1' },
  { id: '2', name: 'Sarah Kim', avatar: '', color: 'bg-chart-2' },
  { id: '3', name: 'Mike Ross', avatar: '', color: 'bg-chart-3' },
  { id: '4', name: 'Emma Davis', avatar: '', color: 'bg-chart-4' },
  { id: '5', name: 'James Lee', avatar: '', color: 'bg-chart-5' },
]

export const groups: Group[] = [
  {
    id: 'g1',
    name: 'Apartment 4B',
    emoji: '🏠',
    members: [users[0], users[1], users[2], users[3]],
    totalExpenses: 2450,
    yourBalance: 125.50
  },
  {
    id: 'g2',
    name: 'Road Trip Gang',
    emoji: '🚗',
    members: [users[0], users[1], users[4], users[5]],
    totalExpenses: 890,
    yourBalance: -45.00
  },
  {
    id: 'g3',
    name: 'Work Lunches',
    emoji: '🍕',
    members: [users[0], users[2], users[3]],
    totalExpenses: 340,
    yourBalance: 28.75
  },
]

export const balances: Balance[] = [
  { user: users[1], amount: 85.50 },
  { user: users[2], amount: -42.00 },
  { user: users[3], amount: 67.25 },
  { user: users[4], amount: -15.00 },
  { user: users[5], amount: 0 },
]

export const expenses: Expense[] = [
  {
    id: 'e1',
    description: 'Grocery run at Whole Foods',
    amount: 156.40,
    paidBy: users[1],
    splitWith: [
      { user: users[0], amount: 39.10, settled: false },
      { user: users[2], amount: 39.10, settled: true },
      { user: users[3], amount: 39.10, settled: false },
    ],
    category: 'groceries',
    emoji: '🛒',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    reactions: [
      { emoji: '👍', users: [users[2]] },
    ]
  },
  {
    id: 'e2',
    description: 'Netflix subscription',
    amount: 22.99,
    paidBy: currentUser,
    splitWith: [
      { user: users[1], amount: 5.75, settled: false },
      { user: users[2], amount: 5.75, settled: false },
      { user: users[3], amount: 5.75, settled: true },
    ],
    category: 'entertainment',
    emoji: '📺',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    reactions: [
      { emoji: '💸', users: [users[1], users[3]] },
    ]
  },
  {
    id: 'e3',
    description: 'Uber to airport',
    amount: 68.00,
    paidBy: users[2],
    splitWith: [
      { user: users[0], amount: 17.00, settled: false },
      { user: users[1], amount: 17.00, settled: true },
      { user: users[4], amount: 17.00, settled: false },
    ],
    category: 'transport',
    emoji: '🚕',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    reactions: []
  },
  {
    id: 'e4',
    description: 'Dinner at Nobu',
    amount: 245.00,
    paidBy: currentUser,
    splitWith: [
      { user: users[1], amount: 61.25, settled: false },
      { user: users[3], amount: 61.25, settled: false },
      { user: users[4], amount: 61.25, settled: true },
    ],
    category: 'food',
    emoji: '🍣',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    reactions: [
      { emoji: '😋', users: [users[1], users[3], users[4]] },
      { emoji: '💸', users: [users[3]] },
    ]
  },
  {
    id: 'e5',
    description: 'Electric bill - March',
    amount: 128.50,
    paidBy: users[3],
    splitWith: [
      { user: users[0], amount: 32.13, settled: false },
      { user: users[1], amount: 32.13, settled: true },
      { user: users[2], amount: 32.13, settled: false },
    ],
    category: 'utilities',
    emoji: '⚡',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    reactions: []
  },
]

export const categories = [
  { id: 'food', name: 'Food & Drinks', emoji: '🍔' },
  { id: 'groceries', name: 'Groceries', emoji: '🛒' },
  { id: 'transport', name: 'Transport', emoji: '🚗' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'utilities', name: 'Utilities', emoji: '💡' },
  { id: 'rent', name: 'Rent', emoji: '🏠' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'other', name: 'Other', emoji: '📦' },
]

export const weeklyStats = {
  totalSpent: 847.50,
  totalOwed: 152.75,
  totalOwing: 57.00,
  topCategory: 'Food & Drinks',
  expenseCount: 12,
  settledCount: 8,
  biggestSpender: users[1],
  mostGenerous: currentUser,
}
