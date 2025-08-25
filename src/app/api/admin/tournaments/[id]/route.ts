import { NextRequest, NextResponse } from 'next/server';
import { TournamentModel } from '@/models/Tournament';
import { connectMongo } from '@/config/mongodb';
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod'; // Keep z for ZodError instance check

// Helper function to handle common error responses
function handleError(error: unknown, context: string) {
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
 * GET /api/admin/tournaments/:id
 * Fetches a single tournament by its ID. Requires admin access.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    await connectMongo();
    const tournament = await TournamentModel.findById(params.id).lean();
    if (!tournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tournament }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminTournamentGET');
  }
}

/**
 * PUT /api/admin/tournaments/:id
 * Updates a tournament. Requires admin access.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    await connectMongo();
    const body = await req.json();
    const updatedTournament = await TournamentModel.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!updatedTournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedTournament }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminTournamentPUT');
  }
}

/**
 * DELETE /api/admin/tournaments/:id
 * Deletes a tournament. Requires admin access.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    await connectMongo();
    const deletedTournament = await TournamentModel.findByIdAndDelete(params.id);
    if (!deletedTournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Tournament deleted' }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminTournamentDELETE');
  }
}