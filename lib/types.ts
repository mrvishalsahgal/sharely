export interface User {
  id: string
  _id?: string
  name: string
  email: string
  avatar?: string
  color?: string
}

export interface Group {
  id: string
  _id?: string
  name: string
  emoji: string
  type: string
  members: User[]
  totalExpenses?: number
  userBalance?: number
}

export interface Expense {
  id: string
  _id?: string
  title: string
  amount: number
  date: string
  category: string
  paidBy: User | string
  splits: {
    user: User | string
    amountOwed: number
    hasSettled: boolean
  }[]
}

export interface Balance {
  user: User
  amount: number
}

export interface Activity {
  id: string
  _id?: string
  type: 'expense' | 'settlement'
  title: string
  amount: number
  date: string
  user: User
  groupName?: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
}
