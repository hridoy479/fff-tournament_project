export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';
import { authenticateAdmin } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const numericId = parseInt(params.id, 10);
    const payload = await req.json();
    const update: any = {};

    if (payload.title) {
      update.title = payload.title;
    }
    if (payload.date) {
      const date = new Date(payload.date);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      update.date = date;
    }
    if (typeof payload.entry_fee === 'number') {
      if (payload.entry_fee < 0) {
        return NextResponse.json({ error: 'Entry fee cannot be negative' }, { status: 400 });
      }
      update.entry_fee = payload.entry_fee;
    }
    if (payload.status) {
      const allowedStatuses = ['upcoming', 'started', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(payload.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      update.status = payload.status;
    }

    await connectMongo();
    await TournamentModel.updateOne({ id: numericId }, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/tournaments/[id] error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const numericId = parseInt(params.id, 10);
    await connectMongo();
    await TournamentModel.deleteOne({ id: numericId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/tournaments/[id] error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


