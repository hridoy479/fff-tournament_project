import { NextResponse, NextRequest } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { TournamentModel } from '@/models/Tournament';
import { authenticateToken } from '@/lib/authMiddleware';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (!('success' in authResult && authResult.success)) {
      return authResult as NextResponse; // Authentication failed
    }

    // Validate required fields
    const required = ['title', 'date', 'image', 'entry_fee', 'prize', 'joined_players', 'max_players', 'category', 'status'];
    for (const key of required) {
      if (!data[key] && data[key] !== 0 && key !== 'image' && key !== 'prize' && key !== 'max_players') {
        return NextResponse.json({ success: false, message: `${key} is required` }, { status: 400 });
      }
    }

    // Validate numeric fields
    if (typeof data.entry_fee !== 'number' || data.entry_fee < 0) {
      return NextResponse.json({ success: false, message: 'Invalid entry_fee' }, { status: 400 });
    }
    if (typeof data.joined_players !== 'number' || data.joined_players < 0) {
      return NextResponse.json({ success: false, message: 'Invalid joined_players' }, { status: 400 });
    }
    if (data.max_players && (typeof data.max_players !== 'number' || data.max_players < 0)) {
      return NextResponse.json({ success: false, message: 'Invalid max_players' }, { status: 400 });
    }

    // Validate category
    const allowedCategories = ['freefire', 'ludo', 'E Football'];
    if (!allowedCategories.includes(data.category.trim())) {
      return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
    }

    // Validate status
    const allowedStatuses = ['upcoming', 'started', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(data.status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    // Convert date
    const tournamentDate = new Date(data.date);
    if (isNaN(tournamentDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date format' }, { status: 400 });
    }

    // Connect to MongoDB
    await connectMongo();

    // Generate a new unique 'id' for the tournament
    // Find the last tournament to get the next sequential ID
    const lastTournament = await TournamentModel.findOne({}).sort({ id: -1 }).lean();
    const nextId = (lastTournament?.id ?? 0) + 1;

    // Save tournament
    const tournament = new TournamentModel({
      ...data,
      id: nextId,
      date: tournamentDate,
    });

    const saved = await tournament.save();

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    console.error('Add Tournament Error:', err);
    return NextResponse.json({ success: false, message: 'Failed to add tournament' }, { status: 500 });
  }
}
