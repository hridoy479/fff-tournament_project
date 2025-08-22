import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const paymentData = await req.json();

  console.log('UddoktaPay callback:', paymentData);

  // TODO: update your database here if needed

  return NextResponse.json({ status: 'received' });
}
