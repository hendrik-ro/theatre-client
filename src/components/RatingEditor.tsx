import { useState } from "react";
import { useAppDispatch } from "../app/store/hooks";
import { rateMovieThunk, deleteRatingThunk } from "../app/store/ratingsThunks";
import { friendlyError } from "../api/errors";

interface RatingEditorProps {
  movieId: string;
  currentRating?: number;
  onSaved?: () => void;
  onChange?: () => void;
}

export default function RatingEditor({
  movieId,
  currentRating,
  onSaved,
  onChange,
}: RatingEditorProps) {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState<number | "">(currentRating ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === "" || rating < 1 || rating > 10) {
      setError("Please select a valid rating between 1 and 10");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await dispatch(rateMovieThunk({ movieId, rating }));
      onSaved?.();
    } catch (err) {
      setError(friendlyError(err, "Failed to save rating"));
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Remove your rating for this movie?")) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      await dispatch(deleteRatingThunk(movieId));
      setRating("");
      onSaved?.();
    } catch (err) {
      setError(friendlyError(err, "Failed to remove rating"));
    } finally {
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
          onChange?.();
        }}
        disabled={pending}
        className="rating-editor__select"
        aria-label="My rating"
      >
        <option value="">Select a rating...</option>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reverse().map((value) => (
          <option key={value} value={value}>
            {value}
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
          Remove rating
        </button>
      )}
      {error && <p className="rating-editor__error form__error">{error}</p>}
    </form>
  );
}
