import { NextRequest, NextResponse } from 'next/server';
import { admin, initializeFirebaseAdmin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

async function getUserFromToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const idToken = authHeader.split(' ')[1];
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token in getUserFromToken:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  initializeFirebaseAdmin(); // Ensure Firebase Admin SDK is initialized
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  const decodedToken = await getUserFromToken(req);
  if (!decodedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongo();
    const user = await UserModel.findOne({ uid: decodedToken.uid }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      emailVerified: decodedToken.email_verified,
      isAdmin: user.email === process.env.ADMIN_EMAIL,
    });
  } catch (error) {
    console.error('User status fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}