import { useState } from "react";
import { useAppSelector } from "../app/store/hooks";
import { selectRatingByMovieId } from "../app/store/ratingsSlice";
import RatingEditor from "./RatingEditor";

interface RatingDisplayProps {
  movieId: string;
  disabled?: boolean;
}

export default function RatingDisplay({
  movieId,
  disabled = false,
}: RatingDisplayProps) {
  const rating = useAppSelector((state) =>
    selectRatingByMovieId(state, movieId),
  );
  const [editing, setEditing] = useState(false);

  if (disabled) {
    return <span className="rating rating--disabled">—</span>;
  }

  if (editing) {
    return (
      <RatingEditor
        movieId={movieId}
        currentRating={rating ?? undefined}
        onComplete={() => setEditing(false)}
      />
    );
  }

  if (rating !== undefined) {
    return (
      <button
        type="button"
        className="rating rating--active"
        onClick={() => setEditing(true)}
        aria-label={`Change rating: ${rating}/10`}
      >
        ⭐ {rating}/10
      </button>
    );
  }

  return (
    <button
      type="button"
      className="rating rating--empty"
      onClick={() => setEditing(true)}
      aria-label="Add rating"
    >
      ⭐ Rate
    </button>
  );
}
