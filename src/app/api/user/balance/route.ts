import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';
import { authenticateToken } from '@/lib/authMiddleware';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (!('success' in authResult && authResult.success)) {
      return authResult as NextResponse;
    }
    const { decodedToken } = authResult;
    const uid = decodedToken.uid;

    await connectMongo();
    const user = await UserModel.findOne({ uid }).lean();
    return NextResponse.json({ balance: user?.accountBalance ?? 0 });
  } catch (e) {
    console.error("GET /api/user/balance error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


