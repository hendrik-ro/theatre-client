export interface Movie {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  year: number | null;
  runtime: number | null;
  genre: string | null;
  averageRating: number | null;
  ratingCount: number;
}

export interface MovieInput {
  name: string;
  year?: number;
  runtime?: number;
  genre?: string;
}

export interface MoviesMeta {
  totalMovies: number;
  moviesPerYear: { year: number | null; count: number }[];
  moviesPerGenre: { genre: string | null; count: number }[];
}

export interface MoviesPaginated {
  movies: Movie[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MovieFilters {
  year?: number | null;
  genre?: string | null;
  averageRating?: number | null;
  search?: string;
}

export type RatingFilterValue = "all" | "unrated" | "7+" | "8+" | "9+";
