import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Firebase Admin SDK: missing required environment variables. " +
      "Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env.local."
    );
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.error("Firebase admin initialization error", error);
    }
  }
}

// Only export if the app was successfully initialised
const app = admin.apps[0];
const adminAuth = app ? admin.auth() : null;
const adminDb = app ? admin.firestore() : null;

export { adminAuth, adminDb };
