import { NextRequest, NextResponse } from 'next/server';
import { admin, initializeFirebaseAdmin } from '@/config/firebaseAdmin';

function isAdminEmail(email?: string | null) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  return !!email && !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase();
}

export async function authenticateAdmin(req: NextRequest) {
  initializeFirebaseAdmin(); // Ensure Firebase Admin SDK is initialized

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return { error: 'Unauthorized', status: 401 };

  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) return { error: 'Forbidden', status: 403 };
    return { decodedToken: decoded };
  } catch (e) {
    console.error("Authentication error:", e);
    return { error: 'Unauthorized', status: 401 };
  }
}