import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);

  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  const { decodedToken } = authResult;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (decodedToken.email !== adminEmail) {
    const user = await UserModel.findOne({ uid: decodedToken.uid });
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectMongo();

    const userToUpdate = await UserModel.findById(userId);

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    return NextResponse.json({ message: 'User role updated successfully', user: userToUpdate });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
