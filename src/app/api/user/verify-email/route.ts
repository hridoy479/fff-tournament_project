
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid } = decodedToken;

    await connectMongo();

    const user = await UserModel.findOne({ uid });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    user.emailVerified = true;
    await user.save();

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
