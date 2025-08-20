import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface ICounter extends Document {
  _id: string; // Name of the counter (e.g., 'tournamentId')
  seq: number; // The current sequence value
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export const CounterModel = models.Counter || model<ICounter>('Counter', CounterSchema);
