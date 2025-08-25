import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient(); // Initialize PrismaClient

function handleError(error: unknown, context: string) {
  console.error(`[${context}] Error:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
  }
  return NextResponse.json(
    { message: `Internal server error while ${context.toLowerCase()}` },
    { status: 500 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Removed connectMongo() as it's no longer needed
    const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminAlertsGET');
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Removed connectMongo() as it's no longer needed
    const body = await req.json();
    const { message, isActive } = body;
    const savedAlert = await prisma.alert.create({
      data: { message, isActive },
    });
    return NextResponse.json({ success: true, data: savedAlert }, { status: 201 });
  } catch (error) {
    return handleError(error, 'AdminAlertsPOST');
  } finally {
    await prisma.$disconnect();
  }
}