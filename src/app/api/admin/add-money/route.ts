import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Removed connectMongo() as it's no longer needed

    const { userId, amount, description } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json({ message: 'User ID and amount are required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { uid: userId },
      data: {
        accountBalance: {
          increment: amount,
        },
      },
    });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await prisma.transaction.create({
      data: {
        user_uid: userId,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        description: description || `Admin added ${amount} to account balance`,
      },
    });

    return NextResponse.json({ message: 'Money added successfully', user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error adding money:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
