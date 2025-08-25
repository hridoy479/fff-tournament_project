import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);

  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  const { decodedToken } = authResult;
  const firebaseUid = decodedToken.uid;

  try {
    await connectMongo();

    const user = await UserModel.findOne({ uid: firebaseUid });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
