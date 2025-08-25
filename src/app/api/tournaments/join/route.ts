export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

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

    // Removed connectMongo() as it's no longer needed

    const existingPlayer = await prisma.tournamentPlayer.findUnique({
      where: {
        user_uid_tournament_id: {
          user_uid: firebaseUid,
          tournament_id: tournament_id,
        },
      },
    });

    if (existingPlayer) {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }

    try {
      // Use Prisma's transaction API
      const result = await prisma.$transaction(async (tx) => {
        // Find the tournament
        const tournament = await tx.tournament.findUnique({
          where: { id: tournament_id },
        });

        if (!tournament) {
          throw new Error('Tournament not found');
        }

        // Check tournament status
        if (tournament.status !== 'upcoming') {
          throw new Error('Cannot join a tournament that is not upcoming');
        }

        // Find the user
        const user = await tx.user.findUnique({
          where: { uid: firebaseUid },
        });

        if (!user) {
          throw new Error('User profile not found in database');
        }

        // Check if user has sufficient balance
        if (user.accountBalance < tournament.entry_fee) {
          throw new Error('Insufficient balance to join this tournament');
        }

        // Deduct entry fee from user's account balance atomically
        const updatedUser = await tx.user.update({
          where: { uid: firebaseUid },
          data: {
            accountBalance: {
              decrement: tournament.entry_fee,
            },
          },
        });

        if (!updatedUser) {
          throw new Error('User not found during balance update');
        }

        // Create new TournamentPlayer entry
        const newPlayer = await tx.tournamentPlayer.create({
          data: {
            user_uid: firebaseUid,
            tournament_id: tournament_id,
            game_name: game_name,
          },
        });

        // Update joined_players count in Tournament atomically
        const updatedTournament = await tx.tournament.update({
          where: { id: tournament_id },
          data: {
            joined_players: {
              increment: 1,
            },
          },
        });

        if (!updatedTournament) {
          throw new Error('Tournament not found during joined_players update');
        }

        // Record the transaction
        await tx.transaction.create({
          data: {
            user_uid: firebaseUid,
            amount: tournament.entry_fee,
            type: 'tournament_entry',
            status: 'completed',
            description: `Entry fee for tournament: ${tournament.title}`,
          },
        });

        return { newPlayer };
      });

      return NextResponse.json(
        { message: 'Successfully joined tournament', player: result.newPlayer },
        { status: 200 }
      );
    } catch (transactionError: any) {
      console.error('[JoinTournament] Transaction failed:', transactionError.message);
      let status = 500;
      let message = 'Failed to process joining request due to a transaction error';

      if (transactionError.message === 'Tournament not found') {
        status = 404;
        message = 'Tournament not found';
      } else if (transactionError.message === 'Cannot join a tournament that is not upcoming') {
        status = 400;
        message = 'Cannot join a tournament that is not upcoming';
      } else if (transactionError.message === 'User profile not found in database') {
        status = 404;
        message = 'User profile not found in database';
      } else if (transactionError.message === 'Insufficient balance to join this tournament') {
        status = 402;
        message = 'Insufficient balance to join this tournament';
      }

      return NextResponse.json(
        { message: message },
        { status: status }
      );
    }
  } catch (e) {
    console.error("POST /api/join error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
