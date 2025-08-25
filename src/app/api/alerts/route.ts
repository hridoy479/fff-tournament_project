import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function GET() {
  try {
    // Removed connectMongo() as it's no longer needed
    const alerts = await prisma.alert.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error(`[AlertsGET] Error:`, error);
    return NextResponse.json(
      { message: `Internal server error while fetching alerts` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
