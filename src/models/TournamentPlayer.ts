import mongoose, { Schema, model, models, Document } from 'mongoose';

// Define the interface for a TournamentPlayer document
export interface ITournamentPlayer extends Document {
  user_uid: string; // The Firebase UID of the user who joined the tournament
  tournament_id: number; // The numeric ID of the tournament that was joined
  game_name: string; // The in-game name of the player for this specific tournament
  createdAt?: Date; // Timestamp when the player joined the tournament
}

// Define the Mongoose Schema for the TournamentPlayer
const TournamentPlayerSchema = new Schema<ITournamentPlayer>({
  user_uid: {
    type: String,
    required: true,
    index: true, // Index for faster lookups by user
  },
  tournament_id: {
    type: Number,
    required: true,
    index: true, // Index for faster lookups by tournament
  },
  game_name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
});

// Create a compound unique index to ensure a user can only join a specific tournament once
TournamentPlayerSchema.index({ user_uid: 1, tournament_id: 1 }, { unique: true });

// Export the Mongoose Model.
export const TournamentPlayerModel = models.TournamentPlayer || model<ITournamentPlayer>('TournamentPlayer', TournamentPlayerSchema);