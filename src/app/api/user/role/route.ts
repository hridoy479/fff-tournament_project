import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);

  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  const { decodedToken } = authResult;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (decodedToken.email !== adminEmail) {
    const user = await prisma.user.findUnique({ where: { uid: decodedToken.uid } });
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Removed connectMongo() as it's no longer needed

    const updatedUser = await prisma.user.update({
      where: { uid: userId },
      data: { role: role },
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
