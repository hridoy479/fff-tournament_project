export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    const admin = getFirebaseAdmin();
    if (!admin) return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    await connectMongo();
    const user = await UserModel.findOne({ uid }).lean();
    return NextResponse.json({ balance: user?.balance ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


