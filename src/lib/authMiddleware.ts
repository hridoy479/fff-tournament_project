import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/config/firebaseAdmin';

export async function authenticateToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Attach decodedToken to the request for further use
    // In Next.js API routes, you might pass this as a prop or context
    // For simplicity, we'll just return it here and the route handler will use it.
    return { success: true, decodedToken };
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
  }
}