import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware'; // Our custom authentication middleware
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

/**
 * POST /api/user/sync-profile
 * Syncs Firebase authenticated user data with PostgreSQL.
 * Creates a new user document if it doesn't exist, or confirms existence.
 * This route is protected by Firebase ID token verification.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate the request using the Firebase ID token
  const authResult = await authenticateToken(req);

  // If authentication fails, return the error response from the middleware
  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  // Extract Firebase UID and email from the decoded token
  const { decodedToken } = authResult;
  const firebaseUid = decodedToken.uid;
  const firebaseEmail = decodedToken.email;
  const firebaseName = decodedToken.name;
  console.log('Decoded Token:', decodedToken);

  try {
    // 2. Removed connectMongo() as it's no longer needed

    // 3. Check if the user already exists in PostgreSQL
    let user = await prisma.user.findUnique({ where: { uid: firebaseUid } });

    if (!user) {
      // 4. If user does not exist, create a new user document
      user = await prisma.user.create({
        data: {
          uid: firebaseUid,
          email: firebaseEmail,
          username: firebaseName,
          accountBalance: 0, // Initialize with default balances
          gameBalance: 0,
        },
      });
      console.log(`[SyncProfile] New user created in PostgreSQL for Firebase UID: ${firebaseUid}`);
      return NextResponse.json(
        { message: 'User profile synced successfully (created)', user: user }, // Return user data
        { status: 201 } // 201 Created status
      );
    } else {
      // 5. If user already exists, confirm existence (no update needed for basic sync)
      console.log(`[SyncProfile] User already exists in PostgreSQL for Firebase UID: ${firebaseUid}`);
      return NextResponse.json(
        { message: 'User profile synced successfully (exists)', user: user }, // Return existing user data
        { status: 200 } // 200 OK status
      );
    }
  } catch (error) {
    console.error('[SyncProfile] Error syncing user profile to PostgreSQL:', error);
    return NextResponse.json(
      { message: 'Internal server error during profile sync' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}