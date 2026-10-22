import { useAppSelector } from "../app/store/hooks";
import { selectRatingByMovieId } from "../app/store/ratingsSlice";

interface RatingDisplayProps {
  movieId: string;
}

// Read-only view of the current user's own rating for a movie.
// Rating happens on the movie detail page.
export default function RatingDisplay({ movieId }: RatingDisplayProps) {
  const rating = useAppSelector((state) =>
    selectRatingByMovieId(state, movieId),
  );

  return (
    <span className={rating !== undefined ? "rating" : "rating rating--empty"}>
      {rating ?? "-"}
    </span>
  );
}
