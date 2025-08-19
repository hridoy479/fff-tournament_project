import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { TournamentModel } from '@/models/Tournament';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tournamentData = body;

    // Validate category
    if (!tournamentData.category || !['freefire', 'ludo', 'E FootBall'].includes(tournamentData.category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category. Allowed categories: freefire, ludo, E FootBall' },
        { status: 400 }
      );
    }

    // Convert the date string to a Date object if it exists
    if (tournamentData.date) {
      try {
        tournamentData.date = new Date(tournamentData.date);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: 'Invalid date format' },
          { status: 400 }
        );
      }
    }

    // Connect to MongoDB
    if (mongoose.connections[0].readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rrr-tournaments');
    }

    // Create tournament
    const newTournament = new TournamentModel(tournamentData);
    const savedTournament = await newTournament.save();

    return NextResponse.json(
      { success: true, data: savedTournament },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding tournament:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add tournament' },
      { status: 500 }
    );
  }
}
