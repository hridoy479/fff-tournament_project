import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { authenticateToken } from '@/lib/authMiddleware';

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (!('success' in authResult && authResult.success)) {
      return authResult as NextResponse;
    }
    const { decodedToken } = authResult;
    const uid = decodedToken.uid;

    // Removed connectMongo() as it's no longer needed
    const user = await prisma.user.findUnique({ where: { uid } });
    return NextResponse.json({ balance: user?.accountBalance ?? 0 });
  } catch (e) {
    console.error("GET /api/user/balance error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


