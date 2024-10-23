// lib/firebaseAdmin.js
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  });
}

const adminDB = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

export { adminDB, FieldValue };
