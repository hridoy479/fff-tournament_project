import { NextRequest, NextResponse } from 'next/server';
import { AlertModel } from '@/models/Alert';
import { connectMongo } from '@/config/mongodb';
import { authenticateAdmin } from '@/lib/auth';
import { z } from 'zod';

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

    await connectMongo();
    const alerts = await AlertModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    return handleError(error, 'AdminAlertsGET');
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectMongo();
    const body = await req.json();
    const { message, isActive } = body;
    const newAlert = new AlertModel({ message, isActive });
    const savedAlert = await newAlert.save();
    return NextResponse.json({ success: true, data: savedAlert }, { status: 201 });
  } catch (error) {
    return handleError(error, 'AdminAlertsPOST');
  }
}