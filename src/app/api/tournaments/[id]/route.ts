import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const numericId = parseInt(params.id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid tournament ID' }, { status: 400 });
    }

    const tournament = await TournamentModel.findOne({ id: numericId }).lean();

    if (!tournament) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error) {
    console.error('[API/Tournaments/[id]] Error fetching tournament:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching tournament' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const numericId = parseInt(params.id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid tournament ID' }, { status: 400 });
    }

    const body = await req.json();

    const updatedTournament = await TournamentModel.findOneAndUpdate({ id: numericId }, body, { new: true });

    if (!updatedTournament) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ tournament: updatedTournament }, { status: 200 });
  } catch (error) {
    console.error('[API/Tournaments/[id]] Error updating tournament:', error);
    return NextResponse.json(
      { message: 'Internal server error while updating tournament' },
      { status: 500 }
    );
  }
}