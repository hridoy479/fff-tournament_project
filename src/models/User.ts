import mongoose, { Schema, model, models, Document } from 'mongoose';

// Define the interface for a User document
export interface IUser extends Document {
  uid: string; // Firebase User ID (UID) - unique identifier from Firebase Authentication
  email?: string; // User's email, optional as some Firebase auth methods might not provide it
  accountBalance: number; // Balance available for general use (e.g., deposits, withdrawals)
  gameBalance: number; // Balance specifically for in-game activities or tournament entries
  createdAt?: Date; // Timestamp when the user record was created
  updatedAt?: Date; // Timestamp when the user record was last updated
}

// Define the Mongoose Schema for the User
const UserSchema = new Schema<IUser>({
  uid: {
    type: String,
    required: true,
    unique: true, // Ensures each Firebase UID is associated with only one user document
    index: true,   // Creates an index for faster lookups by UID
  },
  email: {
    type: String,
    // Optional: You might want to add unique: true here if you want to ensure unique emails across your app,
    // but Firebase already handles email uniqueness for its auth methods.
  },
  accountBalance: {
    type: Number,
    required: true,
    default: 0, // Default value for new users
  },
  gameBalance: {
    type: Number,
    required: true,
    default: 0, // Default value for new users
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Export the Mongoose Model.
// `models.User` checks if the model already exists to prevent re-compilation in Next.js hot-reloading.
export const UserModel = models.User || model<IUser>('User', UserSchema);