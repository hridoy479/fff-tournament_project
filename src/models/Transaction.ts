import mongoose, { Schema, model, models } from 'mongoose';

export interface ITransaction {
  _id?: mongoose.Types.ObjectId;
  user_uid: string;
  amount: number;
  type: 'entry_fee' | 'deposit' | 'withdrawal';
  status: 'success' | 'failed' | 'pending';
  tournament_id?: number;
  createdAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  user_uid: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['entry_fee', 'deposit', 'withdrawal'], required: true },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  tournament_id: { type: Number },
}, { timestamps: { createdAt: true, updatedAt: false } });

TransactionSchema.index({ user_uid: 1, createdAt: -1 });

export const TransactionModel = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);


