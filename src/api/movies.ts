import type { Movie, MovieInput } from "../types/movie";

const BASE = "/api/movies";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body: unknown = await res.json();
      if (
        body !== null &&
        typeof body === "object" &&
        "message" in body &&
        typeof body.message === "string"
      ) {
        message = body.message;
      }
    } catch {
      // non-JSON error body, keep default message
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export function getMovies(): Promise<Movie[]> {
  return request<Movie[]>(BASE);
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
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteMovie(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`${BASE}/${id}`, {
    method: "DELETE",
  });
}
