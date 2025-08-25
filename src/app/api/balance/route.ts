import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { UserModel as User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    const { userId, amount, action } = await req.json();

    if (!userId || !amount || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'bonus') {
      user.accountBalance += amount;
    } else if (action === 'fine') {
      user.accountBalance -= amount;
    }

    await user.save();

    return NextResponse.json({ message: 'Balance updated successfully', user });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
