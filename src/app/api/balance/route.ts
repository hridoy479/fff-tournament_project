import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function POST(req: NextRequest) {
  try {
    // Removed connectMongo() as it's no longer needed

    const { userId, amount, action } = await req.json();

    if (!userId || !amount || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let updatedUser;
    if (action === 'bonus') {
      updatedUser = await prisma.user.update({
        where: { uid: userId },
        data: {
          accountBalance: {
            increment: amount,
          },
        },
      });
    } else if (action === 'fine') {
      updatedUser = await prisma.user.update({
        where: { uid: userId },
        data: {
          accountBalance: {
            decrement: amount,
          },
        },
      });
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Balance updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
