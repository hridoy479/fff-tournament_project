import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { UserModel as User } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const users = await User.find({}, 'username email _id accountBalance');

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
