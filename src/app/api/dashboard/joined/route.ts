export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { TournamentPlayerModel } from '@/models/TournamentPlayer';
import { TournamentModel } from '@/models/Tournament';

export async function GET(req: NextRequest) {
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

    await connectMongo();
    const playerRows = await TournamentPlayerModel.find({ user_uid: uid }).lean();
    const ids = playerRows.map((r: any) => r.tournament_id);
    if (ids.length === 0) return NextResponse.json({ items: [] });
    const tourRows = await TournamentModel.find({ id: { $in: ids } }).lean();
    const idToTournament: Record<number, any> = Object.fromEntries(
      (tourRows || []).map((t: any) => [t.id, t])
    );

    const items = (playerRows || []).map((row: any) => {
      const t = idToTournament[row.tournament_id] || {};
      return {
        tournament_id: row.tournament_id,
        game_name: row.game_name,
        title: t.title ?? 'Tournament',
        date: t.date ?? new Date().toISOString(),
        entry_fee: t.entry_fee ?? 0,
        status: t.status ?? 'upcoming',
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


