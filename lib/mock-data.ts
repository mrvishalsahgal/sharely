export * from './types'
export * from './constants'

// Compatibility placeholders for files not yet migrated
export const currentUser: any = { id: '0', name: 'User' }
export const users: any[] = []
export const groups: any[] = []
export const balances: any[] = []
export const expenses: any[] = []
export const weeklyStats: any = {
  totalSpent: 0,
  totalOwed: 0,
  totalOwing: 0,
  biggestSpender: { name: 'User' },
  mostGenerous: { name: 'User' },
  expenseCount: 0,
  settledCount: 0
}
