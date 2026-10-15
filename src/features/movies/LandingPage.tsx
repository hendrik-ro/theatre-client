import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMoviesMetaData } from "../../api/movies";
import type { MoviesMeta } from "../../types/movie";
import { useAuth } from "../../app/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState<MoviesMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMoviesMetaData()
      .then((result) => {
        if (!cancelled) {
          setMeta(result);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load metadata",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="page">
        <p className="form__error">{error}</p>
        <Link className="back-link" to="/movies">
          Back to library
        </Link>
      </section>
    );
  }

  if (meta === null) {
    return (
      <section className="page">
        <p className="muted">Loading…</p>
      </section>
    );
  }

  if (meta.totalMovies === 0) {
    return (
      <section className="page">
        <header className="page__header">
          <h1>Overview</h1>
          <p className="page__subtitle">Watched films, tracked here.</p>
        </header>
        <div className="panel">
          <h2>Getting started</h2>
          <p className="muted">
            No movies yet. Add the first one to see your library grow.
          </p>
          <Link
            className="panel__action"
            to={user ? "/movies/new" : "/register"}
          >
            {user ? "Add the first movie" : "Register to get started"}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page__header page__header--row">
        <div>
          <h1>Overview</h1>
          <p className="page__subtitle">
            {meta.totalMovies} {meta.totalMovies === 1 ? "movie" : "movies"}{" "}
            released in {meta.moviesPerYear.length}{" "}
            {meta.moviesPerYear.length === 1 ? "year" : "different years"}.
          </p>
        </div>
        {user ? (
          <Link className="page__action" to="/movies/new">
            Add movie
          </Link>
        ) : (
          <div className="page__actions">
            <Link className="page__action" to="/login">
              Log in
            </Link>
            <Link className="page__action" to="/register">
              Register
            </Link>
          </div>
        )}
      </header>

      <div className="panel">
        <h2>Genres</h2>
        {meta.moviesPerGenre.length === 0 ? (
          <p className="muted">No genres recorded yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Genre</th>
                <th>Movies</th>
              </tr>
            </thead>
            <tbody>
              {meta.moviesPerGenre.map((entry) => (
                <tr key={entry.genre === null ? "unknown" : entry.genre}>
                  <td>
                    <Link
                      to={`/movies?genre=${
                        entry.genre === null
                          ? "unknown"
                          : encodeURIComponent(entry.genre)
                      }`}
                      className="table__link"
                    >
                      {entry.genre === null ? "Unknown" : entry.genre}
                    </Link>
                  </td>
                  <td>{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
