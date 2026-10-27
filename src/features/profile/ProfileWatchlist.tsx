import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, removeFromWatchlist } from "../../api/watchlists";
import { friendlyError } from "../../api/errors";
import type { Movie } from "../../types/movie";
import { useAuth } from "../../app/AuthContext";
import RatingDisplay from "../../components/RatingDisplay";
import { useSelector } from "react-redux";
import { selectAllRatings } from "../../app/store/ratingsSlice";

type MovieWithUserRating = Movie & {
  userRating: number | undefined;
};

type SortKey =
  "name" | "year" | "runtime" | "imdb" | "genre" | "avg_rating" | "my_rating";
type SortDir = "asc" | "desc";

const SORT_ACCESSORS: Record<
  SortKey,
  (movie: MovieWithUserRating) => string | null | number
> = {
  name: (movie) => movie.name,
  year: (movie) => movie.year,
  runtime: (movie) => movie.runtime,
  imdb: (movie) => movie.imdbRating,
  genre: (movie) => movie.genre,
  avg_rating: (movie) => movie.averageRating,
  my_rating: (movie) => movie.userRating ?? null,
};

const TEXT_KEYS: SortKey[] = ["name", "genre"];

function compareMovies(
  a: MovieWithUserRating,
  b: MovieWithUserRating,
  key: SortKey,
  dir: SortDir,
) {
  const av = SORT_ACCESSORS[key](a);
  const bv = SORT_ACCESSORS[key](b);
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  const cmp = TEXT_KEYS.includes(key)
    ? String(av).localeCompare(String(bv))
    : Number(av) - Number(bv);
  return dir === "asc" ? cmp : -cmp;
}

export default function ProfileWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Movie[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const allRatings = useSelector(selectAllRatings);

  const userRatingsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const rating of allRatings) {
      map.set(rating.movieId, rating.rating);
    }
    return map;
  }, [allRatings]);

  // The watchlist only exists for signed-in users
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getWatchlist()
      .then((entries) => {
        if (!cancelled) setWatchlist(entries);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(friendlyError(err, "Failed to load your watchlist"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const moviesWithUserRatings = useMemo(() => {
    if (!watchlist) return null;
    return watchlist.map((movie) => ({
      ...movie,
      userRating: userRatingsMap.get(movie.id),
    }));
  }, [watchlist, userRatingsMap]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleRemoveFromWatchlist(movie: Movie) {
    if (removingId !== null) return;
    const previous = watchlist;
    setError(null);
    setRemovingId(movie.id);
    setWatchlist(
      (list) => list?.filter((entry) => entry.id !== movie.id) ?? null,
    );
    try {
      await removeFromWatchlist(movie.id);
    } catch (err) {
      setWatchlist(previous);
      setError(friendlyError(err, "Failed to update your watchlist"));
    } finally {
      setRemovingId(null);
    }
  }

  const sortedMovies = useMemo(() => {
    if (!moviesWithUserRatings) return null;
    let filtered = moviesWithUserRatings;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.name.toLowerCase().includes(query),
      );
    }

    return [...filtered].sort((a, b) => compareMovies(a, b, sortKey, sortDir));
  }, [moviesWithUserRatings, sortKey, sortDir, searchQuery]);

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
          onClick={() => handleSort(key)}
        >
          {label}
          {active && (sortDir === "asc" ? " \u2191" : " \u2193")}
        </button>
      </th>
    );
  }

  if (!user) return null;

  return (
    <div className="panel">
      <h2>Watchlist</h2>
      {error && <p className="form__error">{error}</p>}
      {watchlist === null && !error && <p className="muted">Loading…</p>}
      {watchlist !== null && watchlist.length === 0 && (
        <p className="muted">
          Your watchlist is empty.{" "}
          <Link to="/">Browse movies to add some.</Link>
        </p>
      )}
      {sortedMovies !== null && (
        <>
          <div className="filters">
            <label className="filters__field">
              <span>Search Watchlist</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by movie name..."
                className="input"
              />
            </label>
            {searchQuery && (
              <button
                type="button"
                className="filters__clear filters__clear--small"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </button>
            )}
          </div>
          {sortedMovies.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  {sortHeader("name", "Name")}
                  {sortHeader("year", "Year")}
                  {sortHeader("runtime", "Runtime")}
                  {sortHeader("genre", "Genre")}
                  {sortHeader("imdb", "IMDb")}
                  {sortHeader("avg_rating", "Theatre Ø")}
                  {sortHeader("my_rating", "My rating")}
                  <th aria-label="Remove" />
                </tr>
              </thead>
              <tbody>
                {sortedMovies.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <Link to={`/movies/${entry.id}`} className="table__link">
                        {entry.name}
                      </Link>
                    </td>
                    <td>{entry.year ?? "-"}</td>
                    <td>
                      {entry.runtime !== null ? `${entry.runtime} min` : "-"}
                    </td>
                    <td>{entry.genre ?? "-"}</td>
                    <td>{entry.imdbRating ?? "-"}</td>
                    <td>
                      {entry.ratingCount >= 2 ? entry.averageRating : "-"}
                    </td>
                    <td>
                      <RatingDisplay movieId={entry.id} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="table__action table__action--danger"
                        aria-label={`Remove ${entry.name} from watchlist`}
                        onClick={() => void handleRemoveFromWatchlist(entry)}
                        disabled={removingId !== null}
                      >
                        x
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {sortedMovies.length === 0 && (
            <p className="muted">No movies match your search.</p>
          )}
        </>
      )}
    </div>
  );
}
