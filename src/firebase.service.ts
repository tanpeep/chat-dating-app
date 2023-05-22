import * as admin from 'firebase-admin';

const serviceAccount = require('../serviceAccountKey.json'); // Replace with the path to your service account key JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firestore = admin.firestore()
