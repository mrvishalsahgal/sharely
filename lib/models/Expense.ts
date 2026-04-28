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
