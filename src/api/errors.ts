import { ApiError } from "./client";

// Maps any thrown API error to a message fit for a user to read. Server
// JSON error bodies are already user-facing; what this adds is coverage
// for the cases where no server answer exists at all.
export function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    // request() already attempted a token refresh, so this 401 means
    // the session is truly gone.
    if (err.status === 401) return "Please log in again.";
    return err.message;
  }
  // fetch rejects with a TypeError when the request never reaches the
  // server: server down, DNS failure, or the browser being offline.
  if (err instanceof TypeError) {
    return "Cannot reach the server — check your connection and try again.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
