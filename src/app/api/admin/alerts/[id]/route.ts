import { NextRequest, NextResponse } from 'next/server';
import { AlertModel } from '@/models/Alert';
import { connectMongo } from '@/config/mongodb';
import { authenticateAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectMongo();
    const { id } = params;
    const body = await req.json();
    const { isActive } = body;

    const updatedAlert = await AlertModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedAlert) {
      return NextResponse.json({ success: false, message: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedAlert }, { status: 200 });
  } catch (error) {
    console.error(`[AdminAlertsPUT] Error:`, error);
    return NextResponse.json(
      { message: `Internal server error while updating alert` },
      { status: 500 }
    );
  }
}