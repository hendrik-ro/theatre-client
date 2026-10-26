import type {
  Movie,
  MovieInput,
  MoviesMeta,
  MoviesPaginated,
  MovieFilters,
} from "../types/movie";
import { request } from "./client";

const BASE = "/api/movies";

export interface SortParams {
  sortBy: string;
  sortDir: string;
}

export function getMovies(): Promise<Movie[]> {
  return request<Movie[]>(BASE);
}

export function getMoviesPaginated(
  page: number,
  limit: number,
  filters: MovieFilters = {},
  sort: SortParams = { sortBy: "year", sortDir: "asc" },
): Promise<MoviesPaginated> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (filters.year !== undefined) {
    params.set("year", String(filters.year));
  }
  if (filters.genre !== undefined) {
    params.set("genre", filters.genre ?? "");
  }
  if (filters.imdbRating !== undefined) {
    params.set("imdbRating", String(filters.imdbRating));
  }
  if (filters.averageRating !== undefined) {
    params.set("averageRating", String(filters.averageRating));
  }
  if (filters.search) {
    params.set("search", filters.search);
  }

  params.set("sortBy", sort.sortBy);
  params.set("sortDir", sort.sortDir);

  return request<MoviesPaginated>(`${BASE}?${params.toString()}`);
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
