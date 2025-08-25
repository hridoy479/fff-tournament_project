import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod'; // Keep z for ZodError instance check

const prisma = new PrismaClient(); // Initialize PrismaClient

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
    // Removed connectMongo() as it's no longer needed
    const tournament = await prisma.tournament.findUnique({ where: { id: parseInt(params.id) } });
    if (!tournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tournament }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminTournamentGET');
  } finally {
    await prisma.$disconnect();
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
    // Removed connectMongo() as it's no longer needed
    const body = await req.json();
    const updatedTournament = await prisma.tournament.update({
      where: { id: parseInt(params.id) },
      data: body,
    });
    if (!updatedTournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedTournament }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminTournamentPUT');
  } finally {
    await prisma.$disconnect();
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
    // Removed connectMongo() as it's no longer needed
    const deletedTournament = await prisma.tournament.delete({
      where: { id: parseInt(params.id) },
    });
    if (!deletedTournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Tournament deleted' }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminTournamentDELETE');
  } finally {
    await prisma.$disconnect();
  }
}