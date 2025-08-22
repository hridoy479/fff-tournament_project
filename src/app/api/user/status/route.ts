
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    return NextResponse.json({
      uid: user.uid,
      emailVerified: user.emailVerified,
      username: user.username,
    });
  } catch (error) {
    console.error('User status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
