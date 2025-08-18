export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/config/supabaseServer';
import { admin } from '@/config/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    let firebaseUid: string | null = null;
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      firebaseUid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { tournamentId } = await req.json();
    if (!tournamentId || typeof tournamentId !== 'number') {
      return NextResponse.json({ error: 'Invalid tournamentId' }, { status: 400 });
    }

    const { data: existing, error: selErr } = await supabaseServer
      .from('tournament_joins')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', firebaseUid as string)
      .maybeSingle();

    if (selErr && selErr.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Select failed' }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }

    const { error: insErr } = await supabaseServer
      .from('tournament_joins')
      .insert({ tournament_id: tournamentId, user_id: firebaseUid as string });

    if (insErr) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


