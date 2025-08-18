export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';

function isAdminEmail(email?: string | null) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!email && !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const admin = getFirebaseAdmin();
    if (!admin) return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectMongo();
    const tournaments = await TournamentModel.find({}).sort({ date: 1 }).lean();
    return NextResponse.json({ tournaments });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getFirebaseAdmin();
    if (!admin) return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, date, entry_fee, status } = await req.json();
    if (!title || !date || typeof entry_fee !== 'number' || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await connectMongo();
    const last = await TournamentModel.findOne({}).sort({ id: -1 }).lean();
    const nextId = (last?.id ?? 0) + 1;
    const created = await TournamentModel.create({ id: nextId, title, date: new Date(date), entry_fee, status });
    return NextResponse.json({ ok: true, tournament: created });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


