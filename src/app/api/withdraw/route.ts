import { NextRequest, NextResponse } from 'next/server';
import { admin, initializeFirebaseAdmin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';
import { TransactionModel } from '@/models/Transaction';
import { z } from 'zod';

const withdrawSchema = z.object({
  amount: z.number().min(1, 'Amount must be a positive number'),
});

export async function POST(req: NextRequest) {
  initializeFirebaseAdmin(); // Ensure Firebase Admin SDK is initialized

  try {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid } = decodedToken;

    const body = await req.json();
    const validation = withdrawSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.errors }, { status: 400 });
    }

    const { amount } = validation.data;

    await connectMongo();

    const user = await UserModel.findOne({ uid });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.accountBalance < amount) { // Changed from user.balance to user.accountBalance
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    user.accountBalance -= amount; // Changed from user.balance to user.accountBalance
    await user.save();

    const transaction = new TransactionModel({
      user_uid: user.uid, // Changed from userId: user._id
      amount,
      type: 'withdraw',
      status: 'completed',
      description: `Withdrawal of ${amount} BDT`,
    });
    await transaction.save();

    return NextResponse.json({ message: 'Withdrawal successful', balance: user.accountBalance }, { status: 200 });

  } catch (error) {
    console.error('[API/Withdraw] Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
