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
