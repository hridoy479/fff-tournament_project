import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient(); // Initialize PrismaClient

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

    // Removed connectMongo() as it's no longer needed

    // Prisma handles auto-incrementing IDs, so no need to find lastTournament or calculate nextId
    const tournament = await prisma.tournament.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });

    return NextResponse.json({ success: true, data: tournament }, { status: 201 });
  } catch (err) {
    console.error('Add Tournament Error:', err);
    return NextResponse.json({ success: false, message: 'Failed to add tournament' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}