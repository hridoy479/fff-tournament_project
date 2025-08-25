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

    const { tournamentId, game_name } = await req.json();
    if (typeof tournamentId !== 'number' || !game_name || game_name.trim() === '') {
      return NextResponse.json({ error: 'Invalid tournamentId or game name' }, { status: 400 });
    }

    // Removed connectMongo() as it's no longer needed

    const existing = await prisma.tournamentPlayer.findUnique({
      where: {
        user_uid_tournament_id: {
          user_uid: firebaseUid,
          tournament_id: tournamentId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }

    await prisma.tournamentPlayer.create({
      data: {
        user_uid: firebaseUid,
        tournament_id: tournamentId,
        game_name: game_name,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/join error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


