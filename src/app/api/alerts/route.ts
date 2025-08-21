import { NextResponse } from 'next/server';
import { AlertModel } from '@/models/Alert';
import { connectMongo } from '@/config/mongodb';

export async function GET() {
  try {
    await connectMongo();
    const alerts = await AlertModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error(`[AlertsGET] Error:`, error);
    return NextResponse.json(
      { message: `Internal server error while fetching alerts` },
      { status: 500 }
    );
  }
}
