import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createMovie, getMovies } from "../../api/movies";
import type { Movie } from "../../types/movie";
import MovieForm from "./MovieForm";

export default function MoviesList() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMovies()
      .then((result) => {
        if (!cancelled) {
          result.sort((a, b) => {
            if (a.year && b.year) {
              return a.year - b.year;
            } else {
              return 1;
            }
          });
          setMovies(result);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load movies",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(input: Parameters<typeof createMovie>[0]) {
    await createMovie(input);
    setMovies(await getMovies());
  }

  return (
    <section className="page">
      <header className="page__header">
        <h1>Movies</h1>
        <p className="page__subtitle">Watched films, tracked here.</p>
      </header>

      <div className="panel">
        <h2>Add a movie</h2>
        <MovieForm submitLabel="Add movie" onSubmit={handleCreate} />
      </div>

      <div className="panel">
        <h2>Library</h2>
        {error && <p className="form__error">{error}</p>}
        {movies === null && !error && <p className="muted">Loading…</p>}
        {movies?.length === 0 && <p className="muted">No movies yet.</p>}
        {movies && movies.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Runtime</th>
                <th>IMDb</th>
                <th>Genre</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <Link to={`/movies/${movie.id}`} className="table__link">
                      {movie.name}
                    </Link>
                  </td>
                  <td>{movie.year ?? "—"}</td>
                  <td>
                    {movie.runtime !== null ? `${movie.runtime} min` : "—"}
                  </td>
                  <td>{movie.imdbRating ?? "—"}</td>
                  <td>{movie.genre ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
