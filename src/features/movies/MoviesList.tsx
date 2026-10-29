import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMoviesPaginated, getMoviesMetaData } from "../../api/movies";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../../api/watchlists";
import { friendlyError } from "../../api/errors";
import type {
  Movie,
  MoviesMeta,
  MoviesPaginated,
  RatingFilterValue,
} from "../../types/movie";
import { useAuth } from "../../app/AuthContext";
import MovieFilters, {
  parseRatingFilter,
  ratingToServerValue,
} from "./MovieFilters";
import type { GenreFilter, YearFilter } from "./MovieFilters";
import MovieTable from "../../components/MovieTable";
import useMoviesWithUserRatings from "../../hooks/useMoviesWithUserRatings";

type SortKey =
  "name" | "year" | "runtime" | "genre" | "avg_rating" | "my_rating";
type SortDir = "asc" | "desc";

// Filters live in the URL (?year=, ?genre=) so filtered views are
// shareable, bookmarkable, and survive refresh and back/forward
// navigation. "unknown" selects rows whose value is null; anything
// unparseable is ignored rather than crashing the page.
function parseYearFilter(raw: string | null): YearFilter {
  if (raw === null) return null;
  if (raw === "unknown") return "unknown";
  const year = Number(raw);
  return Number.isInteger(year) ? year : null;
}

function parseGenreFilter(raw: string | null): GenreFilter {
  if (raw === null) return null;
  if (raw === "unknown") return "unknown";
  return raw;
}

function filterToParam(value: YearFilter | GenreFilter): string | null {
  if (value === null) return null;
  if (value === "unknown") return "unknown";
  return String(value);
}

export default function MoviesList() {
  const { user } = useAuth();
  const [moviesPaginated, setMoviesPaginated] =
    useState<MoviesPaginated | null>(null);
  const [meta, setMeta] = useState<MoviesMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string> | null>(null);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filter and sort values from URL
  const yearFilter = parseYearFilter(searchParams.get("year"));
  const genreFilter = parseGenreFilter(searchParams.get("genre"));
  const averageRatingFilter = parseRatingFilter(
    searchParams.get("averageRating"),
  );
  const currentPage = Number(searchParams.get("page") ?? "1");
  const sortKey = (searchParams.get("sortBy") as SortKey) || "year";
  const sortDir = (searchParams.get("sortDir") as SortDir) || "asc";
  const searchQuery = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce search input - only fire when inputValue differs from searchQuery
  useEffect(() => {
    if (inputValue === searchQuery) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (inputValue) {
        params.set("search", inputValue);
      } else {
        params.delete("search");
      }
      params.delete("page");
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchQuery, searchParams, setSearchParams]);

  // Fetch paginated movies with server-side filtering
  useEffect(() => {
    let cancelled = false;
    const requestFilter: Record<string, unknown> = {};
    if (yearFilter !== null) {
      requestFilter.year = yearFilter === "unknown" ? null : yearFilter;
    }
    if (genreFilter !== null) {
      requestFilter.genre = genreFilter === "unknown" ? null : genreFilter;
    }
    const averageRating = ratingToServerValue(averageRatingFilter);
    if (averageRating !== undefined) {
      requestFilter.averageRating = averageRating;
    }
    if (searchQuery) {
      requestFilter.search = searchQuery;
    }
    Promise.all([
      getMoviesPaginated(currentPage, 20, requestFilter, {
        sortBy: sortKey,
        sortDir,
      }),
      getMoviesMetaData(),
    ])
      .then(([paginated, moviesMeta]) => {
        if (!cancelled) {
          setMoviesPaginated(paginated);
          setMeta(moviesMeta);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(friendlyError(err, "Failed to load movies"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    yearFilter,
    genreFilter,
    averageRatingFilter,
    searchQuery,
    sortKey,
    sortDir,
  ]);

  const moviesWithUserRatings = useMoviesWithUserRatings(
    moviesPaginated?.movies ?? null,
  );

  // The watchlist only exists for signed-in users; the auth context
  // resolves asynchronously, so this re-runs when login state settles.
  // No reset-on-logout is needed: every watchlist render below is gated
  // on `user`, and a new session always refetches.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getWatchlist()
      .then((entries) => {
        if (!cancelled) {
          setWatchlist(new Set(entries.map((entry) => entry.id)));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setWatchlistError(
            friendlyError(err, "Failed to load your watchlist"),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleSort(key: SortKey) {
    const params = new URLSearchParams(searchParams);
    if (key === sortKey) {
      params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", key);
      params.set("sortDir", "asc");
    }
    params.delete("page");
    setSearchParams(params);
  }

  // Optimistic toggle: the local set flips immediately and rolls back
  // if the server call fails. pendingId disables all toggles while one
  // is in flight, keeping the local set a reliable rollback snapshot.
  async function toggleWatchlist(movie: Movie) {
    if (!user || pendingId !== null) return;
    const wasInList = watchlist?.has(movie.id) ?? false;
    const previous = watchlist;
    setWatchlistError(null);
    setPendingId(movie.id);
    setWatchlist((list) => {
      const next = new Set(list ?? []);
      if (wasInList) next.delete(movie.id);
      else next.add(movie.id);
      return next;
    });
    try {
      if (wasInList) await removeFromWatchlist(movie.id);
      else await addToWatchlist(movie.id);
    } catch (err) {
      setWatchlist(previous);
      setWatchlistError(friendlyError(err, "Failed to update your watchlist"));
    } finally {
      setPendingId(null);
    }
  }

  function setFilterParam(key: "year" | "genre", value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Reset to page 1 when filters change
    next.delete("page");
    setSearchParams(next);
  }

  function setRatingFilterParam(
    key: "averageRating",
    value: RatingFilterValue,
  ) {
    const next = new URLSearchParams(searchParams);
    if (value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Reset to page 1 when filters change
    next.delete("page");
    setSearchParams(next);
  }

  function clearAllFilters() {
    setSearchParams({});
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  }

  return (
    <section className="page">
      <header className="page__header page__header--row">
        <div>
          <h1>Movies</h1>
          <p className="page__subtitle">Watched films, tracked here.</p>
        </div>
        {user && (
          <Link className="page__action" to="/movies/new">
            Add movie
          </Link>
        )}
      </header>

      <div className="panel">
        <h2>Library</h2>
        {error && <p className="form__error">{error}</p>}
        {user && watchlistError && (
          <p className="form__error">{watchlistError}</p>
        )}
        {moviesPaginated === null && meta === null && !error && (
          <p className="muted">Loading\u2026</p>
        )}
        {meta !== null && meta.totalMovies === 0 && (
          <>
            <p className="muted">No movies yet.</p>
            {user ? (
              <Link className="panel__action" to="/movies/new">
                Add the first movie
              </Link>
            ) : (
              <Link className="panel__action" to="/login">
                Log in to add movies
              </Link>
            )}
          </>
        )}
        {meta !== null && (
          <>
            <div className="filters">
              <label className="filters__field">
                <span>Search</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search by movie name..."
                  className="input"
                />
              </label>
              {searchQuery && (
                <button
                  type="button"
                  className="filters__clear filters__clear--small"
                  onClick={() => setInputValue("")}
                >
                  Clear
                </button>
              )}
            </div>
            <MovieFilters
              meta={meta}
              year={yearFilter}
              genre={genreFilter}
              averageRating={averageRatingFilter}
              onYearChange={(year) =>
                setFilterParam("year", filterToParam(year))
              }
              onGenreChange={(genre) =>
                setFilterParam("genre", filterToParam(genre))
              }
              onAverageRatingChange={(rating) =>
                setRatingFilterParam("averageRating", rating)
              }
              onClearAll={clearAllFilters}
            />
          </>
        )}
        {meta !== null &&
          meta.totalMovies > 0 &&
          moviesWithUserRatings !== null &&
          moviesWithUserRatings.length === 0 && (
            <>
              <p className="muted">
                {searchQuery
                  ? "No movies match your search."
                  : "No movies match the current filters."}
              </p>
              {searchQuery ? (
                <button
                  type="button"
                  className="filters__clear filters__clear--small"
                  onClick={() => setInputValue("")}
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  className="filters__clear filters__clear--small"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </button>
              )}
            </>
          )}
        {meta !== null &&
          meta.totalMovies > 0 &&
          moviesWithUserRatings !== null &&
          moviesWithUserRatings.length > 0 && (
            <>
              <MovieTable
                movies={moviesWithUserRatings}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                showUserRating={!!user}
                user={!!user}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlist}
                pendingId={pendingId}
              />
              {moviesPaginated && moviesPaginated.totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    className="pagination__button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <span className="pagination__info">
                    Page {currentPage} of {moviesPaginated.totalPages}
                  </span>
                  <button
                    type="button"
                    className="pagination__button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === moviesPaginated.totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </section>
  );
}
