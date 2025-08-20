import { NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';

export async function GET() {
  try {
    await connectMongo();
    const tournaments = await TournamentModel.find({}).sort({ date: 1 }).lean();
    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error) {
    console.error('[API/Tournaments] Error fetching tournaments:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching tournaments' },
      { status: 500 }
    );
  }
}
