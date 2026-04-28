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
