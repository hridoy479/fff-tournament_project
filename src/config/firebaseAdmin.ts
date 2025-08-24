import * as admin from 'firebase-admin';

export function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const serviceAccountConfig = process.env.FIREBASE_ADMIN_SDK_CONFIG;

      if (!serviceAccountConfig) {
        console.error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.');
        throw new Error('Firebase Admin SDK configuration missing.');
      }

      const serviceAccount = JSON.parse(serviceAccountConfig);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin initialization error:', error.message);
      throw error; // Re-throw to indicate a critical setup issue
    }
  }
}

export { admin };
