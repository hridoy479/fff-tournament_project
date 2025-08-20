import mongoose, { Schema, model, models, Document } from 'mongoose';

// Define the interface for a Tournament document
export interface ITournament extends Document {
  id: number; // A numeric ID for the tournament, useful for frontend display or simpler lookups
  title: string; // The name or title of the tournament
  date: Date; // The date and time when the tournament is scheduled
  entry_fee: number; // The cost to enter the tournament
  status: 'upcoming' | 'started' | 'completed' | 'cancelled'; // Current status of the tournament
  image?: string; // URL to the tournament's banner image
  prize?: string; // Description of the prize (e.g., "₹5000 Cash Prize")
  joined_players: number; // Current number of players who have joined
  max_players?: number; // Maximum number of players allowed in the tournament
  category: string; // The game category (e.g., "Free Fire", "Ludo", "E Football")
  createdAt?: Date; // Timestamp when the tournament record was created
  updatedAt?: Date; // Timestamp when the tournament record was last updated
}

// Define the Mongoose Schema for the Tournament
const TournamentSchema = new Schema<ITournament> ({
  id: {
    type: Number,
    required: true,
    unique: true, // Ensures each tournament has a unique numeric ID
    index: true,   // Creates an index for faster lookups by ID
  },
  title: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of a string
  },
  date: {
    type: Date,
    required: true,
  },
  entry_fee: {
    type: Number,
    required: true,
    default: 0, // Default entry fee is 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'started', 'completed', 'cancelled'], // Allowed values for status
    default: 'upcoming', // Default status for new tournaments
  },
  image: {
    type: String,
  },
  prize: {
    type: String,
    trim: true,
  },
  joined_players: {
    type: Number,
    required: true,
    default: 0, // Starts with 0 joined players
  },
  max_players: {
    type: Number,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Export the Mongoose Model.
export const TournamentModel = models.Tournament || model<ITournament>('Tournament', TournamentSchema);