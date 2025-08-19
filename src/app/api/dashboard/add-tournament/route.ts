import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { TournamentModel } from '@/models/Tournament';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    const required = ['title', 'date', 'image', 'entry_fee', 'prize', 'joined_players', 'max_players', 'category'];
    for (const key of required) {
      if (!data[key] && data[key] !== 0) {
        return NextResponse.json({ success: false, message: `${key} is required` }, { status: 400 });
      }
    }

    // Validate category
    if (!['freefire', 'ludo', 'E Football'].includes(data.category.trim())) {
      return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
    }

    // Convert date
    const tournamentDate = new Date(data.date);
    if (isNaN(tournamentDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date format' }, { status: 400 });
    }

    // Connect to MongoDB
    if (mongoose.connections[0].readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rrr-tournaments');
    }

    // Save tournament
    const tournament = new TournamentModel({
      ...data,
      date: tournamentDate,
    });

    const saved = await tournament.save();

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    console.error('Add Tournament Error:', err);
    return NextResponse.json({ success: false, message: 'Failed to add tournament' }, { status: 500 });
  }
}
