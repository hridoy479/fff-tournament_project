import { NextRequest, NextResponse } from 'next/server';
import { AlertModel } from '@/models/Alert';
import { connectMongo } from '@/config/mongodb';
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod';

// Helper function to handle common error responses
function handleError(error: any, context: string) {
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
    await connectMongo();
    const body = await req.json();
    const { message, isActive } = body;
    const updatedAlert = await AlertModel.findByIdAndUpdate(
      params.id,
      { message, isActive },
      { new: true }
    );
    if (!updatedAlert) {
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedAlert }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminAlertsPUT');
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
    await connectMongo();
    const deletedAlert = await AlertModel.findByIdAndDelete(params.id);
    if (!deletedAlert) {
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Alert deleted' }, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminAlertsDELETE');
  }
}
