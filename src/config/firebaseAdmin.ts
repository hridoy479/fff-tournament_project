import admin from 'firebase-admin';

export function getFirebaseAdmin(): typeof admin | null {
  try {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID as string;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL as string;
      const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY as string | undefined;
      const privateKey = privateKeyRaw?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase Admin env vars are missing. Skipping initialization.');
        return null;
      }

      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }
    return admin;
  } catch (e) {
    console.error('Failed to init Firebase Admin', e);
    return null;
  }
}



