import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, removeFromWatchlist } from "../../api/watchlists";
import { friendlyError } from "../../api/errors";
import type { Movie } from "../../types/movie";
import { useAuth } from "../../app/AuthContext";
import MovieTable from "../../components/MovieTable";
import useMoviesWithUserRatings, {
  type MovieWithUserRating,
} from "../../hooks/useMoviesWithUserRatings";

type SortKey =
  "name" | "year" | "runtime" | "imdb" | "genre" | "avg_rating" | "my_rating";
type SortDir = "asc" | "desc";

const SORT_ACCESSORS: Record<
  SortKey,
  (movie: MovieWithUserRating) => string | null | number | undefined
> = {
  name: (movie) => movie.name,
  year: (movie) => movie.year,
  runtime: (movie) => movie.runtime,
  imdb: (movie) => movie.imdbRating,
  genre: (movie) => movie.genre,
  avg_rating: (movie) => movie.averageRating,
  my_rating: (movie) => movie.userRating,
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
  if (av === null || av === undefined) return 1;
  if (bv === null || bv === undefined) return -1;
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

  // Create a Set of movie IDs for the watchlist
  const watchlistSet = useMemo(() => {
    if (!watchlist) return null;
    return new Set(watchlist.map((movie) => movie.id));
  }, [watchlist]);

  // Add userRating to movies using the hook
  const moviesWithUserRatings = useMoviesWithUserRatings(watchlist);

  // Apply client-side search filtering
  const filteredMovies = useMemo(() => {
    if (!moviesWithUserRatings) return null;
    if (!searchQuery) return moviesWithUserRatings;
    const query = searchQuery.toLowerCase();
    return moviesWithUserRatings.filter((movie) =>
      movie.name.toLowerCase().includes(query),
    );
  }, [moviesWithUserRatings, searchQuery]);

  // Apply client-side sorting
  const sortedMovies = useMemo(() => {
    if (!filteredMovies) return null;
    return [...filteredMovies].sort((a, b) =>
      compareMovies(a, b, sortKey, sortDir),
    );
  }, [filteredMovies, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Wrapper to match MovieTable's toggle signature (it expects toggle, but we only remove)
  async function handleToggleWatchlist(movie: Movie) {
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

  if (!user) return null;

  return (
    <div className="panel">
      <h2>Watchlist</h2>
      {error && <p className="form__error">{error}</p>}
      {watchlist === null && !error && <p className="muted">Loading\u2026</p>}
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
            <MovieTable
              movies={sortedMovies}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              showUserRating={true}
              user={true}
              watchlist={watchlistSet}
              onToggleWatchlist={handleToggleWatchlist}
              pendingId={removingId}
            />
          )}
          {sortedMovies.length === 0 && (
            <p className="muted">No movies match your search.</p>
          )}
        </>
      )}
    </div>
  );
}
