export interface UserMovieRating {
  userId: string;
  movieId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// For the Map-based store, we only need movieId -> rating
export interface RatingEntry {
  movieId: string;
  rating: number;
}
