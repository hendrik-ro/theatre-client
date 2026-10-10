import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMovie, updateMovie } from "../../api/movies";
import type { Movie, MovieInput } from "../../types/movie";
import MovieForm from "./MovieForm";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMovie(id)
      .then((result) => {
        if (!cancelled) setMovie(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load movie");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <section className="page">
        <p className="form__error">{error}</p>
        <Link className="back-link" to="/">
          Back to movies
        </Link>
      </section>
    );
  }

  if (!movie) {
    return (
      <section className="page">
        <p className="muted">Loading…</p>
      </section>
    );
  }

  async function handleUpdate(input: MovieInput) {
    if (!id) return;
    const updated = await updateMovie(id, input);
    setMovie(updated);
    setSaved(true);
  }

  return (
    <section className="page">
      <Link className="back-link" to="/">
        Back to movies
      </Link>
      <header className="page__header">
        <h1>{movie.name}</h1>
        <p className="page__subtitle">
          {[movie.year, movie.genre].filter(Boolean).join(" · ") ||
            "No details"}
        </p>
      </header>

      <div className="panel">
        <h2>Details</h2>
        <dl className="detail">
          <div>
            <dt>Year</dt>
            <dd>{movie.year ?? "—"}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{movie.runtime !== null ? `${movie.runtime} min` : "—"}</dd>
          </div>
          <div>
            <dt>IMDb rating</dt>
            <dd>{movie.imdbRating ?? "—"}</dd>
          </div>
          <div>
            <dt>Genre</dt>
            <dd>{movie.genre ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <h2>Edit</h2>
        <MovieForm
          key={movie.updatedAt}
          initial={movie}
          submitLabel="Save changes"
          onSubmit={handleUpdate}
        />
        {saved && <p className="saved-note">Saved.</p>}
      </div>
    </section>
  );
}
