import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';
import { TransactionModel } from '@/models/Transaction';

export async function POST(req: NextRequest) {
  try {
    // Authenticate and Authorize as Admin
    const authResult = await authenticateAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Parse request body
    const { userId, amount } = await req.json();

    // Input validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ message: 'Invalid userId provided' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount provided. Must be a positive number.' }, { status: 400 });
    }

    // Connect to MongoDB
    await connectMongo();

    // Find user and atomically update balance
    const updatedUser = await UserModel.findOneAndUpdate(
      { uid: userId },
      { $inc: { accountBalance: amount } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Record the transaction
    await TransactionModel.create({
      user_uid: userId,
      amount: amount,
      type: 'admin_add_money',
      status: 'completed',
      description: `Admin added ${amount} BDT to account`,
    });

    return NextResponse.json(
      { message: 'Money added successfully', newBalance: updatedUser.accountBalance },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AdminAddMoney] Error adding money:', error);
    return NextResponse.json(
      { message: 'Internal server error while adding money' },
      { status: 500 }
    );
  }
}
