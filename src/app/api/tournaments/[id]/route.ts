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
    const { id } = await params;
    const numericId = parseInt(id, 10);
    console.log(`[API/Tournaments/[id]] PUT request for ID: ${numericId}`);

    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid tournament ID' }, { status: 400 });
    }

    const body = await req.json();
    console.log(`[API/Tournaments/[id]] PUT request body:`, body);

    const updatedTournament = await TournamentModel.findOneAndUpdate({ id: numericId }, { $set: body }, { new: true });
    console.log(`[API/Tournaments/[id]] Updated Tournament (from findOneAndUpdate):`, updatedTournament);

    // Fetch the tournament again to confirm the update
    const confirmedTournament = await TournamentModel.findOne({ id: numericId }).lean();
    console.log(`[API/Tournaments/[id]] Confirmed Tournament (after re-fetch):`, confirmedTournament);

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid tournament ID' }, { status: 400 });
    }

    const deletedTournament = await TournamentModel.findOneAndDelete({ id: numericId });

    if (!deletedTournament) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tournament deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[API/Tournaments/[id]] Error deleting tournament:', error);
    return NextResponse.json(
      { message: 'Internal server error while deleting tournament' },
      { status: 500 }
    );
  }
}
