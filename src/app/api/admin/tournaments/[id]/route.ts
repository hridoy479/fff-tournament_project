export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';

function isAdminEmail(email?: string | null) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!email && !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase();
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = getFirebaseAdmin();
    if (!admin) return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const numericId = parseInt(params.id, 10);
    const payload = await req.json();
    const update: any = {};
    if (payload.title) update.title = payload.title;
    if (payload.date) update.date = new Date(payload.date);
    if (typeof payload.entry_fee === 'number') update.entry_fee = payload.entry_fee;
    if (payload.status) update.status = payload.status;

    await connectMongo();
    await TournamentModel.updateOne({ id: numericId }, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = getFirebaseAdmin();
    if (!admin) return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const numericId = parseInt(params.id, 10);
    await connectMongo();
    await TournamentModel.deleteOne({ id: numericId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


