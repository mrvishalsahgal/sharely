import mongoose, { Schema, Document } from 'mongoose'

export interface IInvite extends Document {
  code: string
  inviterId: mongoose.Types.ObjectId
  type: 'friend' | 'group'
  targetId?: mongoose.Types.ObjectId // Group ID if type is 'group'
  email?: string
  phone?: string
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: Date
  createdAt: Date
}

const InviteSchema = new Schema<IInvite>({
  code:      { type: String, required: true, unique: true },
  inviterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['friend', 'group'], default: 'friend' },
  targetId:  { type: Schema.Types.ObjectId, ref: 'Group' },
  email:     { type: String },
  phone:     { type: String },
  status:    { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true })

// Index for finding by code
InviteSchema.index({ code: 1 })
// TTL index to automatically expire invites if we want (optional, for now we handle manually)

export default mongoose.models.Invite || mongoose.model<IInvite>('Invite', InviteSchema)
