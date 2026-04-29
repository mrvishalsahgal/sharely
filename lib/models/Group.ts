import mongoose, { Schema, Document } from 'mongoose'

export interface IGroup extends Document {
  name: string
  emoji: string
  type: 'home' | 'trip' | 'event' | 'couple' | 'other'
  members: mongoose.Types.ObjectId[]
  createdBy: mongoose.Types.ObjectId
  isArchived: boolean
  createdAt: Date
}

const GroupSchema = new Schema<IGroup>({
  name:      { type: String, required: true, trim: true },
  emoji:     { type: String, default: '📦' },
  type:      { type: String, enum: ['home', 'trip', 'event', 'couple', 'other'], default: 'other' },
  members:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true })

// Index for fast querying of groups by member
GroupSchema.index({ members: 1 })

export default mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema)
