export interface Movie {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  year: number | null;
  runtime: number | null;
  imdbRating: number | null;
  genre: string | null;
}

export interface MovieInput {
  name: string;
  year?: number;
  runtime?: number;
  imdbRating?: number;
  genre?: string;
}

export interface MoviesMeta {
  totalMovies: number;
  moviesPerYear: { year: number | null; count: number }[];
  moviesPerGenre: { genre: string | null; count: number }[];
}
