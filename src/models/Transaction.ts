import mongoose, { Schema, model, models, Document } from 'mongoose';

// Define the interface for a Transaction document
export interface ITransaction extends Document {
  user_uid: string; // The Firebase UID of the user involved in the transaction
  amount: number; // The amount of money involved in the transaction
  type: 'deposit' | 'withdrawal' | 'tournament_entry' | 'tournament_prize'; // Type of transaction
  status: 'pending' | 'completed' | 'failed'; // Current status of the transaction
  gateway_transaction_id?: string; // Optional: Transaction ID from the payment gateway (e.g., UddoktaPay)
  description?: string; // Optional: A brief description of the transaction
  createdAt?: Date; // Timestamp when the transaction record was created
}

// Define the Mongoose Schema for the Transaction
const TransactionSchema = new Schema<ITransaction>({
  user_uid: {
    type: String,
    required: true,
    index: true, // Index for faster lookups by user
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'tournament_entry', 'tournament_prize'], // Allowed transaction types
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'], // Allowed transaction statuses
    default: 'pending', // Default status for new transactions
  },
  gateway_transaction_id: {
    type: String,
    unique: true, // Ensures each gateway transaction ID is unique (important for idempotency)
    sparse: true, // Allows multiple documents to have a null value for this field
  },
  description: {
    type: String,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only track creation time for transactions
});

// Export the Mongoose Model.
export const TransactionModel = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);