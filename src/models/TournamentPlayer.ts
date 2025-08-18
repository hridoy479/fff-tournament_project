import mongoose, { Schema, model, models } from 'mongoose';

export interface ITournamentPlayer {
  _id?: mongoose.Types.ObjectId;
  user_uid: string;
  tournament_id: number;
  game_name: string;
  createdAt?: Date;
}

const TournamentPlayerSchema = new Schema<ITournamentPlayer>({
  user_uid: { type: String, required: true, index: true },
  tournament_id: { type: Number, required: true, index: true },
  game_name: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

TournamentPlayerSchema.index({ user_uid: 1, tournament_id: 1 }, { unique: true });

export const TournamentPlayerModel = models.TournamentPlayer || model<ITournamentPlayer>('TournamentPlayer', TournamentPlayerSchema);


