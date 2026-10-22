import { useState } from "react";
import { useAppDispatch } from "../app/store/hooks";
import { rateMovieThunk, deleteRatingThunk } from "../app/store/ratingsThunks";
import { friendlyError } from "../api/errors";

interface RatingEditorProps {
  movieId: string;
  currentRating?: number;
  onComplete: () => void;
}

export default function RatingEditor({
  movieId,
  currentRating,
  onComplete,
}: RatingEditorProps) {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState<number | "">(currentRating ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === "" || rating < 0 || rating > 10) {
      setError("Please select a valid rating between 0 and 10");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await dispatch(rateMovieThunk({ movieId, rating }));
      onComplete();
    } catch (err) {
      setError(friendlyError(err, "Failed to save rating"));
      setPending(false);
    }
  };

  const handleRemove = async () => {
    if (
      !window.confirm(
        "Remove your rating for this movie? This cannot be undone.",
      )
    ) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      await dispatch(deleteRatingThunk(movieId));
      onComplete();
    } catch (err) {
      setError(friendlyError(err, "Failed to remove rating"));
      setPending(false);
    }
  };

  return (
    <form className="rating-editor" onSubmit={handleSubmit}>
      <select
        value={rating}
        onChange={(e) => {
          const value = e.target.value;
          setRating(value === "" ? "" : Number(value));
        }}
        disabled={pending}
        className="rating-editor__select"
      >
        <option value="">Select a rating...</option>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <option key={value} value={value}>
            {value} - {value === 0 ? "Unrated" : `${value}/10`}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending || rating === ""}
        className="rating-editor__button"
      >
        {pending ? "Saving..." : "Rate"}
      </button>
      {currentRating !== undefined && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="rating-editor__remove"
          aria-label="Remove rating"
        >
          ×
        </button>
      )}
      {error && <p className="rating-editor__error form__error">{error}</p>}
    </form>
  );
}
