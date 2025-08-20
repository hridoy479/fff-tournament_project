import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware'; // Our custom authentication middleware
import { connectMongo } from '@/config/mongodb'; // MongoDB connection utility
import { TournamentModel } from '@/models/Tournament'; // Tournament Mongoose model
import { TournamentPlayerModel } from '@/models/TournamentPlayer'; // TournamentPlayer Mongoose model
import { UserModel } from '@/models/User'; // User Mongoose model
import { TransactionModel } from '@/models/Transaction'; // Transaction Mongoose model

/**
 * POST /api/tournaments/join
 * Allows an authenticated user to join a tournament.
 * Handles entry fee deduction and player registration.
 * This route is protected by Firebase ID token verification.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate the request using the Firebase ID token
  const authResult = await authenticateToken(req);

  // If authentication fails, return the error response from the middleware
  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  // Extract Firebase UID from the decoded token
  const { decodedToken } = authResult;
  const firebaseUid = decodedToken.uid;

  try {
    // 2. Connect to MongoDB
    await connectMongo();

    // 3. Parse the request body
    const { tournament_id, game_name } = await req.json();

    // 4. Basic input validation
    if (typeof tournament_id !== 'number' || !game_name || game_name.trim() === '') {
      return NextResponse.json({ message: 'Invalid tournament ID or game name provided' }, { status: 400 });
    }

    // 5. Find the tournament
    const tournament = await TournamentModel.findOne({ id: tournament_id });

    if (!tournament) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    // 6. Check tournament status
    if (tournament.status !== 'upcoming') {
      return NextResponse.json({ message: 'Cannot join a tournament that is not upcoming' }, { status: 400 });
    }

    // 7. Find the user in MongoDB
    const user = await UserModel.findOne({ uid: firebaseUid });

    if (!user) {
      console.error(`[JoinTournament] User not found in MongoDB for Firebase UID: ${firebaseUid}`);
      return NextResponse.json({ message: 'User profile not found in database' }, { status: 404 });
    }

    // 8. Check if user has sufficient balance
    if (user.accountBalance < tournament.entry_fee) {
      return NextResponse.json({ message: 'Insufficient balance to join this tournament' }, { status: 402 }); // 402 Payment Required
    }

    // 9. Check if user has already joined this tournament
    const alreadyJoined = await TournamentPlayerModel.findOne({
      user_uid: firebaseUid,
      tournament_id: tournament_id,
    });

    if (alreadyJoined) {
      return NextResponse.json({ message: 'You have already joined this tournament' }, { status: 400 });
    }

    // 10. Perform the transaction: Deduct entry fee and record participation
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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
  } catch (error) {
    console.error('[JoinTournament] Error joining tournament:', error);
    return NextResponse.json(
      { message: 'Internal server error while joining tournament' },
      { status: 500 }
    );
  }
}