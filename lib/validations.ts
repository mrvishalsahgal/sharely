import { z } from 'zod'

export const groupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  emoji: z.string().optional(),
  type: z.enum(['home', 'trip', 'event', 'couple', 'other']).default('other'),
  memberIds: z.array(z.string()).optional()
})

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().default('other'),
  groupId: z.string().optional().nullable(),
  splitWith: z.array(z.string()).min(1, 'Select at least one person to split with'),
  paidBy: z.string().optional(),
  splits: z.array(z.object({
    userId: z.string(),
    amount: z.number()
  })).optional()
})

export const settlementSchema = z.object({
  toUser: z.string(),
  amount: z.number().positive(),
  method: z.enum(['cash', 'upi', 'bank']).default('cash'),
  groupId: z.string().optional().nullable(),
  note: z.string().optional()
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  color: z.string().optional()
})
