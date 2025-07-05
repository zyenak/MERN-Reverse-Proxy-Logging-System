import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'user';
  email: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

export default mongoose.model<IUser>('User', UserSchema); 