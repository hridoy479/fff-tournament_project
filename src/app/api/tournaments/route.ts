// /app/api/tournaments/route.ts
import { NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query: any = {};
    if (category) query.category = decodeURIComponent(category);

    const tournaments = await TournamentModel.find(query).sort({ date: 1 }).lean();
    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('[API/Tournaments GET] Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const body = await req.json();
    const { title, date, image, entryFee, prize, joinedPlayers, maxPlayers, category, description, status, userId } = body;

    if (!title || !date || !maxPlayers || !userId) {
      return NextResponse.json(
        { message: "Missing required fields: title, date, maxPlayers, and userId are required." },
        { status: 400 }
      );
    }

    const tournament = await TournamentModel.create({
      title,
      date,
      image,
      entry_fee: entryFee,
      prize,
      joined_players: joinedPlayers,
      max_players: maxPlayers,
      category,
      description,
      status,
      userId,
    });

    return NextResponse.json({ message: "Tournament created", tournament }, { status: 201 });
  } catch (error: any) {
    console.error('[API/Tournaments POST] Error:', error);
    return NextResponse.json({ message: 'Failed to create tournament', error: error.message }, { status: 500 });
  }
}
