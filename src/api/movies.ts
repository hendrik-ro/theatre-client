import type { Movie, MovieInput, MoviesMeta } from "../types/movie";
import { request } from "./client";

const BASE = "/api/movies";

export function getMovies(): Promise<Movie[]> {
  return request<Movie[]>(BASE);
}

export function getMoviesMetaData(): Promise<MoviesMeta> {
  return request<MoviesMeta>(`${BASE}/meta`);
}

export function getMovie(id: string): Promise<Movie> {
  return request<Movie>(`${BASE}/${id}`);
}

export function createMovie(input: MovieInput): Promise<Movie> {
  return request<Movie>(BASE, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMovie(id: string, input: MovieInput): Promise<Movie> {
  return request<Movie>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// Admin-only; the server answers 403 for anyone else.
export function deleteMovie(id: string): Promise<void> {
  return request<void>(`/api/admin/movies/${id}`, { method: "DELETE" });
}
