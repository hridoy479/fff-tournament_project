import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../serviceAccountKey.json'); // Adjust path as needed
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export { admin };