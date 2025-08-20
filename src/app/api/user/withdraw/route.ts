import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware'; // Our custom authentication middleware
import { connectMongo } from '@/config/mongodb'; // MongoDB connection utility
import { UserModel } from '@/models/User'; // User Mongoose model
import { TransactionModel } from '@/models/Transaction'; // Transaction Mongoose model

/**
 * POST /api/user/withdraw
 * Handles user withdrawal requests.
 * Deducts amount from user's balance and records a withdrawal transaction.
 * This route is protected by Firebase ID token verification.
 */
export async function POST(req: NextRequest) {
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
    // 2. Connect to MongoDB
    await connectMongo();

    // 3. Parse the request body
    const { amount } = await req.json();

    // 4. Basic input validation
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Invalid withdrawal amount provided' }, { status: 400 });
    }

    // 5. Find the user in MongoDB
    const user = await UserModel.findOne({ uid: firebaseUid });

    if (!user) {
      console.error(`[Withdraw] User not found in MongoDB for Firebase UID: ${firebaseUid}`);
      return NextResponse.json({ message: 'User profile not found in database' }, { status: 404 });
    }

    // 6. Check if user has sufficient balance
    if (user.accountBalance < amount) {
      return NextResponse.json({ message: 'Insufficient balance for withdrawal' }, { status: 402 }); // 402 Payment Required
    }

    // 7. Deduct amount from user's account balance atomically
    const updatedUser = await UserModel.findOneAndUpdate(
      { uid: firebaseUid },
      { $inc: { accountBalance: -amount } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      throw new Error('User not found during balance update');
    }

    // 8. Record the withdrawal transaction
    await TransactionModel.create({
      user_uid: firebaseUid,
      amount: amount,
      type: 'withdrawal',
      status: 'completed', // Assuming immediate completion for balance deduction
      description: `Withdrawal of ${amount} BDT`,
    });

    // 9. Return success response
    return NextResponse.json(
      { message: 'Withdrawal successful', newBalance: user.accountBalance },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Withdraw] Error processing withdrawal:', error);
    return NextResponse.json(
      { message: 'Internal server error while processing withdrawal' },
      { status: 500 }
    );
  }
}