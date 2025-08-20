export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/config/supabaseServer';
import { admin } from '@/config/firebaseAdmin';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware';
import { connectMongo } from '@/config/mongodb';
import { TournamentPlayerModel } from '@/models/TournamentPlayer';

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

    await connectMongo();

    const existing = await TournamentPlayerModel.findOne({
      user_uid: firebaseUid,
      tournament_id: tournamentId,
    });

    if (existing) {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }

    await TournamentPlayerModel.create({
      user_uid: firebaseUid,
      tournament_id: tournamentId,
      game_name: game_name,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/join error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


