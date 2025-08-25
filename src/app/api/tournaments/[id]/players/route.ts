
import { TournamentPlayerModel } from '@/models/TournamentPlayer';
import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();

  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    const players = await TournamentPlayerModel.find({
      tournament_id: numericId,
    }).populate('user_uid', 'name');

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching tournament players:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
