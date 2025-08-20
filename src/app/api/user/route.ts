// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

export async function GET() {
  try {
    await connectMongo(); // Ensure DB is connected
    const users = await UserModel.find().sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
