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
    if (category) {
      // Normalize the incoming category name to match database format (e.g., "freefire" -> "Free Fire")
      const normalizedCategory = decodeURIComponent(category)
        .replace(/-/g, ' ') // Replace hyphens with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(' ');

      query.category = { $regex: new RegExp(`^${normalizedCategory}$`, 'i') };
    }

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
    const { title, date, image, entryFee, prize, joinedPlayers, maxPlayers, category, ffGameType, description, status, userId } = body;

    // Ensure numeric fields are actual numbers
    const parsedEntryFee = Number(entryFee);
    const parsedJoinedPlayers = Number(joinedPlayers);
    const parsedMaxPlayers = Number(maxPlayers);

    // Parse date string to Date object
    const parsedDate = date ? new Date(date) : undefined;

    if (!title || !parsedDate || !parsedMaxPlayers || !userId) {
      return NextResponse.json(
        { message: "Missing required fields: title, date, maxPlayers, and userId are required." },
        { status: 400 }
      );
    }

    const tournament = await TournamentModel.create({
      title,
      date: parsedDate, // Use the parsed Date object
      image,
      entry_fee: parsedEntryFee,
      prize,
      joined_players: parsedJoinedPlayers,
      max_players: parsedMaxPlayers,
      category,
      ffGameType,
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