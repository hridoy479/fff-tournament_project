
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Removed connectMongo() as it's no longer needed

  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    const players = await prisma.tournamentPlayer.findMany({
      where: {
        tournament_id: numericId,
      },
      include: {
        user: {
          select: { username: true }, // Select only the username from the related User model
        },
      },
    });

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching tournament players:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
