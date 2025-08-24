import { NextRequest, NextResponse } from 'next/server';
import { TournamentModel } from '@/models/Tournament';
import { connectMongo } from '@/config/mongodb';
import { createTournament } from '@/services/tournamentService';
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod';

// Helper function to handle common error responses
function handleError(error: any, context: string) {
  console.error(`[${context}] Error:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
  }
  return NextResponse.json(
    { message: `Internal server error while ${context.toLowerCase()}` },
    { status: 500 }
  );
}

/**
 * GET /api/admin/tournaments
 * Fetches all tournaments. Requires admin access.
 */
export async function GET(req: NextRequest) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    await connectMongo();
    const tournaments = await TournamentModel.find({}).sort({ date: 1 }).lean();
    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminTournamentsGET');
  }
}

/**
 * POST /api/admin/tournaments
 * Creates a new tournament. Requires admin access.
 */
export async function POST(req: NextRequest) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    await connectMongo();
    const body = await req.json();
    const savedTournament = await createTournament(body);
    return NextResponse.json({ success: true, data: savedTournament }, { status: 201 });
  } catch (error) {
    return handleError(error, 'AdminTournamentsPOST');
  }
}