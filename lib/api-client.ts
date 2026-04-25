import { auth } from "./firebase";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    // Return a dummy 401 response instead of throwing to avoid crashing effects
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const idToken = await user.getIdToken();

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${idToken}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response;
}
