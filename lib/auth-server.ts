import { adminAuth } from "./firebase-admin";
import { NextRequest } from "next/server";

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!adminAuth) {
    console.error("Firebase Admin SDK is not initialized. Cannot verify ID token.");
    return null;
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}
