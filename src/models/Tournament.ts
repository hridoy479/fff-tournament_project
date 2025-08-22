// src/models/Tournament.ts
import mongoose, { Schema, model, models, Document } from 'mongoose';
import { CounterModel } from './Counter'; // Used for auto-increment IDs

export interface ITournament extends Document {
  id: number; // Auto-incremented numeric ID
  title: string;
  date: Date;
  entry_fee: number;
  status: 'upcoming' | 'started' | 'completed' | 'cancelled';
  image?: string;
  prize?: string;
  joined_players: number;
  max_players?: number;
  category: string;
  ffGameType?: string;
  description?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    id: {
      type: Number,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    entry_fee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'started', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    image: String,
    prize: {
      type: String,
      trim: true,
    },
    joined_players: {
      type: Number,
      default: 0,
    },
    max_players: Number,
    category: {
      type: String,
      required: true,
      trim: true,
    },
    ffGameType: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-increment 'id' before saving
TournamentSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findOneAndUpdate(
        { _id: 'tournamentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      this.id = counter.seq;
    } catch (error:any) {
      console.error('Error in pre-save hook for ID generation:', error);
      return next(error);
    }
  }
  next();
});

export const TournamentModel = models.Tournament || model<ITournament>('Tournament', TournamentSchema);
