import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IAlert extends Document {
  message: string;
  isActive: boolean;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AlertModel = models.Alert || model<IAlert>('Alert', AlertSchema);
