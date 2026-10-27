import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAllRatings } from "../app/store/ratingsSlice";
import type { Movie } from "../types/movie";

export type MovieWithUserRating = Movie & {
  userRating: number | undefined;
};

export default function useMoviesWithUserRatings(
  movies: Movie[] | null,
): MovieWithUserRating[] | null {
  const allRatings = useSelector(selectAllRatings);

  const userRatingsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const rating of allRatings) {
      map.set(rating.movieId, rating.rating);
    }
    return map;
  }, [allRatings]);

  return useMemo(() => {
    if (!movies) return null;
    return movies.map((movie) => ({
      ...movie,
      userRating: userRatingsMap.get(movie.id),
    }));
  }, [movies, userRatingsMap]);
}
