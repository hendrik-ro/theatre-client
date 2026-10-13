import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Movie, MovieInput } from "../../types/movie";

interface MovieFormProps {
  initial?: Movie;
  submitLabel: string;
  onSubmit: (input: MovieInput) => Promise<void>;
  onChange?: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

function fieldsFromMovie(movie?: Movie) {
  return {
    name: movie?.name ?? "",
    year: movie?.year?.toString() ?? "",
    runtime: movie?.runtime?.toString() ?? "",
    imdbRating: movie?.imdbRating?.toString() ?? "",
    genre: movie?.genre ?? "",
  };
}

export default function MovieForm({
  initial,
  submitLabel,
  onSubmit,
  onChange,
}: MovieFormProps) {
  const [fields, setFields] = useState(fieldsFromMovie(initial));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const setField =
    (key: keyof typeof fields) => (event: ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: event.target.value }));
      onChange?.();
    };

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!fields.name.trim()) {
      setError("Name is required");
      return;
    }

    setPending(true);
    const input: MovieInput = {
      name: fields.name.trim(),
      year: fields.year ? Number(fields.year) : undefined,
      runtime: fields.runtime ? Number(fields.runtime) : undefined,
      imdbRating: fields.imdbRating ? Number(fields.imdbRating) : undefined,
      genre: fields.genre.trim() || undefined,
    };
    onSubmit(input)
      .then(() => {
        if (!initial) {
          setFields(fieldsFromMovie());
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        setPending(false);
      });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <span>Name</span>
        <input
          value={fields.name}
          onChange={setField("name")}
          required
          placeholder="The Matrix"
        />
      </label>
      <label className="form__field">
        <span>Year</span>
        <input
          type="number"
          value={fields.year}
          onChange={setField("year")}
          placeholder="1999"
          min={1750}
          max={CURRENT_YEAR}
        />
      </label>
      <label className="form__field">
        <span>Runtime (min)</span>
        <input
          type="number"
          value={fields.runtime}
          onChange={setField("runtime")}
          placeholder="136"
          min={0}
          max={9999}
        />
      </label>
      <label className="form__field">
        <span>IMDb rating</span>
        <input
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={fields.imdbRating}
          onChange={setField("imdbRating")}
          placeholder="8.7"
        />
      </label>
      <label className="form__field">
        <span>Genre</span>
        <input
          value={fields.genre}
          onChange={setField("genre")}
          placeholder="sci-fi"
        />
      </label>
      {error && <p className="form__error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
