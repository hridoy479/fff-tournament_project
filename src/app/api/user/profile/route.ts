import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware'; // Our custom authentication middleware
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

/**
 * GET /api/user/profile
 * Fetches the authenticated user's profile data from PostgreSQL.
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

    // 3. Find the user in PostgreSQL using their Firebase UID
    const user = await prisma.user.findUnique({ where: { uid: firebaseUid } });

    // 4. If user not found, return 404
    if (!user) {
      console.warn(`[UserProfile] User not found in PostgreSQL for Firebase UID: ${firebaseUid}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 5. Return the user's profile data
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      accountBalance: user.accountBalance,
      gameBalance: user.gameBalance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }, { status: 200 });
  } catch (error) {
    console.error('[UserProfile] Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching profile' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}