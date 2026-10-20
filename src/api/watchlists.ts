import type { Movie } from "../types/movie";
import { ApiError, request } from "./client";

const BASE = "/api/watchlists";

// Auth-only endpoint; the server answers 401 for guests.
export function getWatchlist(): Promise<Movie[]> {
  return request<Movie[]>(BASE);
}

// The server answers 409 "Movie already in watchlist" on duplicates.
// A stale client view should converge instead of surfacing that as an
// error, so 409 is treated as success.
export async function addToWatchlist(movieId: string): Promise<void> {
  try {
    await request<unknown>(`${BASE}/${movieId}`, { method: "POST" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) return;
    throw err;
  }
}

// Idempotent server-side: 204 whether or not the entry existed.
export function removeFromWatchlist(movieId: string): Promise<void> {
  return request<void>(`${BASE}/${movieId}`, { method: "DELETE" });
}
