import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware'; // Our custom authentication middleware
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

/**
 * GET /api/dashboard/joined
 * Fetches all tournaments joined by the authenticated user.
 * This route is protected by Firebase ID token verification.
 */
export async function GET(req: NextRequest) {
  // 1. Authenticate the request using the Firebase ID token
  const authResult = await authenticateToken(req);

  // If authentication fails, return the error response from the middleware
  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  // Extract Firebase UID from the decoded token
  const { decodedToken } = authResult;
  const firebaseUid = decodedToken.uid;

  try {
    // 2. Removed connectMongo() as it's no longer needed

    // 3. Find all TournamentPlayer entries for the authenticated user
    const joinedTournamentPlayers = await prisma.tournamentPlayer.findMany({ where: { user_uid: firebaseUid } });

    // 4. Extract unique tournament IDs from the joined entries
    const tournamentIds = joinedTournamentPlayers.map(player => player.tournament_id);

    // 5. Fetch the details of these tournaments
    const tournaments = await prisma.tournament.findMany({ where: { id: { in: tournamentIds } } });

    // 6. Combine joined player data with full tournament details
    // This creates a richer object for the frontend
    const result = joinedTournamentPlayers.map(joinedPlayer => {
      const tournamentDetails = tournaments.find(t => t.id === joinedPlayer.tournament_id);
      return {
        ...joinedPlayer, // Includes user_uid, tournament_id, game_name, createdAt
        tournamentDetails: tournamentDetails, // Full details of the tournament
      };
    });

    // 7. Return the list of joined tournaments with their details
    return NextResponse.json({ joinedTournaments: result }, { status: 200 });
  } catch (error) {
    console.error('[DashboardJoined] Error fetching joined tournaments:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching joined tournaments' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}