import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);

  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  const { decodedToken } = authResult;
  const firebaseUid = decodedToken.uid;

  try {
    // Removed connectMongo() as it's no longer needed

    const user = await prisma.user.findUnique({ where: { uid: firebaseUid } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
