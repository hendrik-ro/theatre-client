import { useEffect, useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import { selectAllRatings } from "../../app/store/ratingsSlice";
import RatingDisplay from "../../components/RatingDisplay";
import MovieFilters, {
  parseRatingFilter,
  ratingToServerValue,
} from "./MovieFilters";
import type { GenreFilter, YearFilter } from "./MovieFilters";

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
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filter values from URL
  const yearFilter = parseYearFilter(searchParams.get("year"));
  const genreFilter = parseGenreFilter(searchParams.get("genre"));
  const imdbRatingFilter = parseRatingFilter(searchParams.get("imdbRating"));
  const averageRatingFilter = parseRatingFilter(
    searchParams.get("averageRating"),
  );
  const currentPage = Number(searchParams.get("page") ?? "1");

  const allRatings = useSelector(selectAllRatings);

  // Fetch paginated movies with server-side filtering
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMoviesPaginated(currentPage, 20, {
        year: yearFilter === "unknown" ? null : yearFilter,
        genre: genreFilter === "unknown" ? null : genreFilter,
        imdbRating: ratingToServerValue(imdbRatingFilter),
        averageRating: ratingToServerValue(averageRatingFilter),
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
    imdbRatingFilter,
    averageRatingFilter,
  ]);

  const userRatingsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const rating of allRatings) {
      map.set(rating.movieId, rating.rating);
    }
    return map;
  }, [allRatings]);

  const moviesWithUserRatings = useMemo(() => {
    if (!moviesPaginated) return null;
    return moviesPaginated.movies.map((movie) => ({
      ...movie,
      userRating: userRatingsMap.get(movie.id),
    }));
  }, [moviesPaginated, userRatingsMap]);

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

  // Server handles filtering, we just sort the results
  const visibleMovies = useMemo(() => {
    if (moviesWithUserRatings === null) return null;
    return moviesWithUserRatings.sort((a, b) =>
      compareMovies(a, b, sortKey, sortDir),
    );
  }, [moviesWithUserRatings, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
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
    key: "imdbRating" | "averageRating",
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

  const hasMovies = (moviesPaginated?.total ?? 0) > 0;

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
          <p className="muted">Loading…</p>
        )}
        {moviesPaginated !== null &&
          meta !== null &&
          moviesPaginated.total === 0 && (
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
        {meta !== null && hasMovies && (
          <MovieFilters
            meta={meta}
            year={yearFilter}
            genre={genreFilter}
            imdbRating={imdbRatingFilter}
            averageRating={averageRatingFilter}
            onYearChange={(year) => setFilterParam("year", filterToParam(year))}
            onGenreChange={(genre) =>
              setFilterParam("genre", filterToParam(genre))
            }
            onImdbRatingChange={(rating) =>
              setRatingFilterParam("imdbRating", rating)
            }
            onAverageRatingChange={(rating) =>
              setRatingFilterParam("averageRating", rating)
            }
            onClearAll={clearAllFilters}
          />
        )}
        {hasMovies && visibleMovies !== null && visibleMovies.length === 0 && (
          <>
            <p className="muted">No movies match the current filters.</p>
            <button type="button" onClick={clearAllFilters}>
              Clear all filters
            </button>
          </>
        )}
        {visibleMovies !== null && visibleMovies.length > 0 && (
          <>
            <table className="table">
              <thead>
                <tr>
                  {sortHeader("name", "Name")}
                  {sortHeader("year", "Year")}
                  {sortHeader("runtime", "Runtime")}
                  {sortHeader("genre", "Genre")}
                  {sortHeader("imdb", "IMDb")}
                  {sortHeader("avg_rating", "Theatre Ø")}
                  {user && sortHeader("my_rating", "My rating")}
                  {user && <th aria-label="Watchlist" />}
                </tr>
              </thead>
              <tbody>
                {visibleMovies.map((movie) => (
                  <tr key={movie.id}>
                    <td>
                      <Link to={`/movies/${movie.id}`} className="table__link">
                        {movie.name}
                      </Link>
                    </td>
                    <td>{movie.year ?? "-"}</td>
                    <td>
                      {movie.runtime !== null ? `${movie.runtime} min` : "-"}
                    </td>
                    <td>{movie.genre ?? "-"}</td>
                    <td>{movie.imdbRating ?? "-"}</td>
                    <td>
                      {movie.ratingCount >= 2 ? movie.averageRating : "-"}
                    </td>
                    {user && (
                      <td>
                        <RatingDisplay movieId={movie.id} />
                      </td>
                    )}
                    {user && (
                      <td>
                        <button
                          type="button"
                          className="table__action"
                          onClick={() => void toggleWatchlist(movie)}
                          disabled={pendingId !== null}
                        >
                          {watchlist?.has(movie.id)
                            ? "Remove from watchlist"
                            : "Add to watchlist"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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
