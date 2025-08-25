import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function GET(req: NextRequest) {
  try {
    // Removed connectMongo() as it's no longer needed

    const users = await prisma.user.findMany({
      select: {
        uid: true, // Corresponds to Mongoose's _id for User
        username: true,
        email: true,
        accountBalance: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
