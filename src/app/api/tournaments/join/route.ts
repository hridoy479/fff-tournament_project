export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import mongoose from 'mongoose';
import { UserModel } from '@/models/User';
import { TournamentPlayerModel } from '@/models/TournamentPlayer';
import { TransactionModel } from '@/models/Transaction';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    const admin = getFirebaseAdmin();
    if (!admin) return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { tournamentId, gameName, entryFee } = await req.json();
    if (!tournamentId || typeof tournamentId !== 'number' || !gameName || typeof entryFee !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await connectMongo();
    const session = await mongoose.startSession();
    let insufficient = false;
    try {
      await session.withTransaction(async () => {
        const user = await UserModel.findOne({ uid }).session(session);
        const currentBalance = user?.balance ?? 0;
        if (currentBalance < entryFee) {
          insufficient = true;
          return;
        }
        await UserModel.updateOne({ uid }, { $inc: { balance: -entryFee } }, { session, upsert: true });
        await TournamentPlayerModel.updateOne(
          { user_uid: uid, tournament_id: tournamentId },
          { $setOnInsert: { game_name: gameName } },
          { upsert: true, session }
        );
        await TransactionModel.create([{ user_uid: uid, amount: entryFee, type: 'entry_fee', status: 'success', tournament_id: tournamentId }], { session });
      });
    } finally {
      await session.endSession();
    }

    if (insufficient) return NextResponse.json({ ok: false, insufficient: true }, { status: 200 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


