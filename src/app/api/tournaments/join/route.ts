export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware';
import { connectMongo } from '@/config/mongodb';
import { TournamentPlayerModel } from '@/models/TournamentPlayer';
import { TournamentModel } from '@/models/Tournament';
import { UserModel } from '@/models/User';
import { TransactionModel } from '@/models/Transaction';
import mongoose from 'mongoose'; // Added mongoose import

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (!('success' in authResult && authResult.success)) {
      return authResult as NextResponse;
    }
    const { decodedToken } = authResult;
    const firebaseUid = decodedToken.uid;

    const { tournament_id, game_name } = await req.json();
    if (typeof tournament_id !== 'number' || !game_name || game_name.trim() === '') {
      return NextResponse.json({ error: 'Invalid tournamentId or game name' }, { status: 400 });
    }

    await connectMongo();

    const existing = await TournamentPlayerModel.findOne({
      user_uid: firebaseUid,
      tournament_id: tournament_id,
    });

    if (existing) {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the tournament
      const tournament = await TournamentModel.findOne({ id: tournament_id }).session(session);

      if (!tournament) {
        await session.abortTransaction();
        return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
      }

      // Check tournament status
      if (tournament.status !== 'upcoming') {
        await session.abortTransaction();
        return NextResponse.json({ message: 'Cannot join a tournament that is not upcoming' }, { status: 400 });
      }

      // Find the user in MongoDB
      const user = await UserModel.findOne({ uid: firebaseUid }).session(session);

      if (!user) {
        await session.abortTransaction();
        return NextResponse.json({ message: 'User profile not found in database' }, { status: 404 });
      }

      // Check if user has sufficient balance
      if (user.accountBalance < tournament.entry_fee) {
        await session.abortTransaction();
        return NextResponse.json({ message: 'Insufficient balance to join this tournament' }, { status: 402 }); // 402 Payment Required
      }

      // Deduct entry fee from user's account balance atomically
      const updatedUser = await UserModel.findOneAndUpdate(
        { uid: firebaseUid },
        { $inc: { accountBalance: -tournament.entry_fee } },
        { new: true, session } // Return the updated document and pass session
      );

      if (!updatedUser) {
        throw new Error('User not found during balance update');
      }

      // Create new TournamentPlayer entry
      const newPlayer = await TournamentPlayerModel.create([
        {
          user_uid: firebaseUid,
          tournament_id: tournament_id,
          game_name: game_name,
        },
      ], { session });

      // Update joined_players count in Tournament atomically
      const updatedTournament = await TournamentModel.findOneAndUpdate(
        { id: tournament_id },
        { $inc: { joined_players: 1 } },
        { new: true, session } // Return the updated document and pass session
      );

      if (!updatedTournament) {
        throw new Error('Tournament not found during joined_players update');
      }

      // Record the transaction
      await TransactionModel.create([
        {
          user_uid: firebaseUid,
          amount: tournament.entry_fee,
          type: 'tournament_entry',
          status: 'completed',
          description: `Entry fee for tournament: ${tournament.title}`,
        },
      ], { session });

      await session.commitTransaction(); // Commit transaction

      return NextResponse.json(
        { message: 'Successfully joined tournament', player: newPlayer[0].toJSON() },
        { status: 200 }
      );
    } catch (transactionError) {
      await session.abortTransaction(); // Abort transaction on error
      console.error('[JoinTournament] Transaction failed:', transactionError);
      return NextResponse.json(
        { message: 'Failed to process joining request due to a transaction error' },
        { status: 500 }
      );
    } finally {
      session.endSession();
    }
  } catch (e) {
    console.error("POST /api/join error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
