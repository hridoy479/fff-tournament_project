import mongoose, { Schema, model, models } from 'mongoose';

export interface ITournament {
  _id?: mongoose.Types.ObjectId;
  id: number; // keep numeric id to match existing routes
  title: string;
  date: Date;
  entry_fee: number;
  status: 'upcoming' | 'started' | 'completed';
  image?: string;
  prize?: string;
  joined_players?: number;
  max_players?: number;
}

const TournamentSchema = new Schema<ITournament>({
  id: { type: Number, required: true, unique: true, index: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  entry_fee: { type: Number, required: true },
  status: { type: String, enum: ['upcoming', 'started', 'completed'], default: 'upcoming' },
  image: { type: String },
  prize: { type: String },
  joined_players: { type: Number },
  max_players: { type: Number }
}, { timestamps: true });

export const TournamentModel = models.Tournament || model<ITournament>('Tournament', TournamentSchema);
