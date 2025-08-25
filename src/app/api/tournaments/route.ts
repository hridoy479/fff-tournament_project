import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { NextRequest } from 'next/server';
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
  ffGameType: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['upcoming', 'started', 'completed', 'cancelled']),
  userId: z.string().min(1, 'User ID is required'),
});

export async function GET(req: NextRequest) {
  try {
    // Removed connectMongo() as it's no longer needed
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let whereClause: any = {};
    if (category) {
      const normalizedCategory = decodeURIComponent(category)
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      whereClause.category = { contains: normalizedCategory, mode: 'insensitive' };
    }

    const tournaments = await prisma.tournament.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('[API/Tournaments GET] Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    // Removed connectMongo() as it's no longer needed
    const body = await req.json();
    const validation = tournamentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.errors }, { status: 400 });
    }

    const { data } = validation;

    const tournament = await prisma.tournament.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        image: data.image,
        entry_fee: data.entry_fee,
        prize: data.prize,
        joined_players: data.joined_players,
        max_players: data.max_players,
        category: data.category,
        ffGameType: data.ffGameType,
        description: data.description,
        status: data.status,
        userId: data.userId,
      },
    });

    return NextResponse.json({ message: "Tournament created", tournament }, { status: 201 });
  } catch (error: unknown) {
    console.error('[API/Tournaments POST] Error:', error);
    return NextResponse.json({ message: 'Failed to create tournament', error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
