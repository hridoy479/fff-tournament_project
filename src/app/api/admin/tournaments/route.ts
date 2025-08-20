import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb'; // MongoDB connection utility
import { TournamentModel } from '@/models/Tournament'; // Our Tournament Mongoose model
import { authenticateAdmin } from '@/lib/auth';

/**
 * GET /api/admin/tournaments
 * Fetches all tournaments. Requires admin access.
 * This route is protected by Firebase ID token verification and admin email check.
 */
export async function GET(req: NextRequest) {
  // 1. Authenticate and Authorize the request
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    // 2. Connect to MongoDB
    await connectMongo();

    // 3. Fetch all tournaments, sorted by date
    const tournaments = await TournamentModel.find({}).sort({ date: 1 }).lean(); // .lean() for plain JS objects

    // 4. Return the list of tournaments
    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error) {
    console.error('[AdminTournamentsGET] Error fetching tournaments:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching tournaments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tournaments
 * Creates a new tournament. Requires admin access.
 * This route is protected by Firebase ID token verification and admin email check.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate and Authorize the request
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    // 2. Parse the request body
    const { title, date, entry_fee, status, image, prize, joined_players, max_players, category } = await req.json();

    // 3. Basic input validation
    if (!title || !date || typeof entry_fee !== 'number' || !status || !category) {
      return NextResponse.json({ message: 'Missing required fields or invalid data' }, { status: 400 });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }

    if (entry_fee < 0) {
      return NextResponse.json({ message: 'Entry fee cannot be negative' }, { status: 400 });
    }

    const allowedStatuses = ['upcoming', 'started', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // 4. Connect to MongoDB
    await connectMongo();

    // 5. Generate a new unique 'id' for the tournament
    // Find the last tournament to get the next sequential ID
    const lastTournament = await TournamentModel.findOne({}).sort({ id: -1 }).lean();
    const nextId = (lastTournament?.id ?? 0) + 1;

    // 6. Create the new tournament document
    const createdTournament = await TournamentModel.create({
      id: nextId,
      title,
      date: parsedDate, // Ensure date is a Date object
      entry_fee,
      status,
      image,
      prize,
      joined_players: joined_players ?? 0, // Default to 0 if not provided
      max_players,
      category,
    });

    // 7. Return the created tournament
    return NextResponse.json(
      { message: 'Tournament created successfully', tournament: createdTournament.toJSON() },
      { status: 201 } // 201 Created status
    );
  } catch (error) {
    console.error('[AdminTournamentsPOST] Error creating tournament:', error);
    return NextResponse.json(
      { message: 'Internal server error while creating tournament' },
      { status: 500 }
    );
  }
}