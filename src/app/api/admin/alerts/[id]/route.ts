import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient(); // Initialize PrismaClient

// Helper function to handle common error responses
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

/**
 * PUT /api/admin/alerts/:id
 * Updates an existing alert. Requires admin access.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    // Removed connectMongo() as it's no longer needed
    const body = await req.json();
    const { message, isActive } = body;
    const updatedAlert = await prisma.alert.update({
      where: { id: parseInt(params.id) },
      data: { message, isActive },
    });
    if (!updatedAlert) {
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedAlert }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminAlertsPUT');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/admin/alerts/:id
 * Deletes an alert. Requires admin access.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    // Removed connectMongo() as it's no longer needed
    const deletedAlert = await prisma.alert.delete({
      where: { id: parseInt(params.id) },
    });
    if (!deletedAlert) {
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Alert deleted' }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminAlertsDELETE');
  } finally {
    await prisma.$disconnect();
  }
}
