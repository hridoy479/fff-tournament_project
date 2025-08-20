import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware'; // Our custom authentication middleware
import { connectMongo } from '@/config/mongodb'; // MongoDB connection utility
import { UserModel } from '@/models/User'; // Our User Mongoose model

/**
 * POST /api/user/sync-profile
 * Syncs Firebase authenticated user data with MongoDB.
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

  try {
    // 2. Connect to MongoDB
    await connectMongo();

    // 3. Check if the user already exists in MongoDB
    let user = await UserModel.findOne({ uid: firebaseUid });

    if (!user) {
      // 4. If user does not exist, create a new user document
      user = await UserModel.create({
        uid: firebaseUid,
        email: firebaseEmail,
        accountBalance: 0, // Initialize with default balances
        gameBalance: 0,
      });
      console.log(`[SyncProfile] New user created in MongoDB for Firebase UID: ${firebaseUid}`);
      return NextResponse.json(
        { message: 'User profile synced successfully (created)', user: user.toJSON() }, // Return user data
        { status: 201 } // 201 Created status
      );
    } else {
      // 5. If user already exists, confirm existence (no update needed for basic sync)
      console.log(`[SyncProfile] User already exists in MongoDB for Firebase UID: ${firebaseUid}`);
      return NextResponse.json(
        { message: 'User profile synced successfully (exists)', user: user.toJSON() }, // Return existing user data
        { status: 200 } // 200 OK status
      );
    }
  } catch (error) {
    console.error('[SyncProfile] Error syncing user profile to MongoDB:', error);
    return NextResponse.json(
      { message: 'Internal server error during profile sync' },
      { status: 500 }
    );
  }
}