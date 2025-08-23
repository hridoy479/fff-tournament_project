import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Firebase Admin initialization failed: serviceAccountKey.json not found.');
      console.error('Please ensure you have a serviceAccountKey.json file in the root of your project.');
    } else {
      console.error('Firebase Admin initialization error', error);
    }
  }
}

export { admin };
