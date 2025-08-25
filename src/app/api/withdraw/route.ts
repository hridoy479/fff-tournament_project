import { NextRequest, NextResponse } from 'next/server';
import { admin, initializeFirebaseAdmin } from '@/config/firebaseAdmin';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { z } from 'zod';

const prisma = new PrismaClient(); // Initialize PrismaClient

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

    // Removed connectMongo() as it's no longer needed

    const user = await prisma.user.findUnique({ where: { uid } });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.accountBalance < amount) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { uid },
      data: {
        accountBalance: {
          decrement: amount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        user_uid: updatedUser.uid,
        amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Withdrawal of ${amount} BDT`,
      },
    });

    return NextResponse.json({ message: 'Withdrawal successful', balance: updatedUser.accountBalance }, { status: 200 });

  } catch (error) {
    console.error('[API/Withdraw] Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
