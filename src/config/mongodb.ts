import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI is not set. Mongo connection will fail.');
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = global as unknown as { _mongoose?: MongooseGlobal };

if (!globalForMongoose._mongoose) {
  globalForMongoose._mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  const state = globalForMongoose._mongoose!;
  if (state.conn) return state.conn;
  if (!state.promise) {
    mongoose.set('strictQuery', true);
    state.promise = mongoose.connect(MONGODB_URI, {
      // bufferCommands defaults are fine; Next.js will reuse connection
    });
  }
  state.conn = await state.promise;
  return state.conn;
}


