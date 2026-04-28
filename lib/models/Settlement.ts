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
