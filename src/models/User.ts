import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  uid: string; // Firebase UID
  balance: number;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true, index: true },
  balance: { type: Number, required: true, default: 0 },
  email: { type: String },
}, { timestamps: true });

export const UserModel = models.User || model<IUser>('User', UserSchema);


