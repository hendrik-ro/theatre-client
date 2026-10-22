import { request } from "./client";
import type { UserMovieRating } from "../types/rating";

const RATINGS_BASE = "/api/ratings";

export interface RatingInput {
  rating: number;
}

// Fetch all ratings for the current user
// Returns ratings sorted by movieId from the server
export async function fetchAllRatings(): Promise<UserMovieRating[]> {
  return request<UserMovieRating[]>(RATINGS_BASE);
}

// Rate or re-rate a movie
export async function rateMovie(
  movieId: string,
  rating: number,
): Promise<UserMovieRating> {
  return request<UserMovieRating>(`${RATINGS_BASE}/${movieId}`, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });
}

// Remove a rating for a movie
export async function deleteRating(movieId: string): Promise<void> {
  return request<void>(`${RATINGS_BASE}/${movieId}`, {
    method: "DELETE",
  });
}

// Get rating for a specific movie
export async function fetchRating(movieId: string): Promise<UserMovieRating> {
  return request<UserMovieRating>(`${RATINGS_BASE}/${movieId}`);
}
