import { NextResponse, NextRequest } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod';

const tournamentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format'),
  image: z.string().optional(),
  entry_fee: z.number().min(0, 'Entry fee must be a positive number'),
  prize: z.string().optional(),
  joined_players: z.number().min(0, 'Joined players must be a positive number'),
  max_players: z.number().min(1, 'Max players must be at least 1'),
  category: z.enum(['freefire', 'ludo', 'E Football']),
  status: z.enum(['upcoming', 'started', 'completed', 'cancelled']),
  ffGameType: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await req.json();
    const validation = tournamentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.errors }, { status: 400 });
    }

    const { data } = validation;

    await connectMongo();

    const lastTournament = await TournamentModel.findOne({}).sort({ id: -1 }).lean();
    const nextId = (lastTournament?.id ?? 0) + 1;

    const tournament = new TournamentModel({
      ...data,
      id: nextId,
      date: new Date(data.date),
    });

    const saved = await tournament.save();

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    console.error('Add Tournament Error:', err);
    return NextResponse.json({ success: false, message: 'Failed to add tournament' }, { status: 500 });
  }
}