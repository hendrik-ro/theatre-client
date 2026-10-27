import { Link } from "react-router-dom";
import RatingDisplay from "./RatingDisplay";
import type { Movie } from "../types/movie";

type SortKey =
  "name" | "year" | "runtime" | "imdb" | "genre" | "avg_rating" | "my_rating";
type SortDir = "asc" | "desc";

interface MovieWithUserRating extends Movie {
  userRating: number | undefined;
}

interface MovieTableProps {
  movies: MovieWithUserRating[] | null;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  showUserRating: boolean;
  user?: boolean;
  watchlist?: Set<string> | null;
  onToggleWatchlist?: (movie: Movie) => void;
  pendingId?: string | null;
}

export default function MovieTable({
  movies,
  sortKey,
  sortDir,
  onSort,
  showUserRating,
  user = false,
  watchlist,
  onToggleWatchlist,
  pendingId,
}: MovieTableProps) {
  function sortHeader(key: SortKey, label: string) {
    const active = sortKey === key;
    return (
      <th
        aria-sort={
          active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <button
          type="button"
          className={active ? "table__sort table__sort--active" : "table__sort"}
          onClick={() => onSort(key)}
        >
          {label}
          {active && (sortDir === "asc" ? " \u2191" : " \u2193")}
        </button>
      </th>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {sortHeader("name", "Name")}
          {sortHeader("year", "Year")}
          {sortHeader("runtime", "Runtime")}
          {sortHeader("genre", "Genre")}
          {sortHeader("imdb", "IMDb")}
          {sortHeader("avg_rating", "Theatre \u00D8")}
          {showUserRating && sortHeader("my_rating", "My rating")}
          {user && onToggleWatchlist && <th aria-label="Watchlist" />}
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
            <td>{movie.year ?? "-"}</td>
            <td>{movie.runtime !== null ? `${movie.runtime} min` : "-"}</td>
            <td>{movie.genre ?? "-"}</td>
            <td>{movie.imdbRating ?? "-"}</td>
            <td>{movie.ratingCount >= 2 ? movie.averageRating : "-"}</td>
            {showUserRating && (
              <td>
                <RatingDisplay movieId={movie.id} />
              </td>
            )}
            {user && onToggleWatchlist && (
              <td>
                <button
                  type="button"
                  className={`table__action${
                    watchlist?.has(movie.id) ? " table__action--danger" : ""
                  }`}
                  onClick={() => onToggleWatchlist(movie)}
                  disabled={pendingId !== null}
                >
                  {watchlist?.has(movie.id) ? "x" : "Add to watchlist"}
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
