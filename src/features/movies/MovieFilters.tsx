import type { ChangeEvent } from "react";
import type { MoviesMeta, RatingFilterValue } from "../../types/movie";

export type YearFilter = number | "unknown" | null;
export type GenreFilter = string | "unknown" | null;

const RATING_OPTIONS: RatingFilterValue[] = [
  "all",
  "unrated",
  "7+",
  "8+",
  "9+",
];

function ratingDisplayName(rating: RatingFilterValue): string {
  switch (rating) {
    case "all":
      return "All ratings";
    case "unrated":
      return "Unrated";
    default:
      return rating;
  }
}

interface MovieFiltersProps {
  meta: MoviesMeta;
  year: YearFilter;
  genre: GenreFilter;
  imdbRating: RatingFilterValue;
  averageRating: RatingFilterValue;
  onYearChange: (year: YearFilter) => void;
  onGenreChange: (genre: GenreFilter) => void;
  onImdbRatingChange: (rating: RatingFilterValue) => void;
  onAverageRatingChange: (rating: RatingFilterValue) => void;
  onClearAll: () => void;
}

function filterValue(value: YearFilter | GenreFilter): string {
  if (value === null) return "all";
  if (value === "unknown") return "unknown";
  return String(value);
}

export default function MovieFilters({
  meta,
  year,
  genre,
  imdbRating,
  averageRating,
  onYearChange,
  onGenreChange,
  onImdbRatingChange,
  onAverageRatingChange,
  onClearAll,
}: MovieFiltersProps) {
  // The meta endpoint returns years ascending; sort genres alphabetically
  // with the "Unknown" bucket last so the options are deterministic.
  const genreOptions = [...meta.moviesPerGenre].sort((a, b) => {
    if (a.genre === null) return 1;
    if (b.genre === null) return -1;
    return a.genre.localeCompare(b.genre);
  });

  function handleYear(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    onYearChange(
      value === "all" ? null : value === "unknown" ? "unknown" : Number(value),
    );
  }

  function handleGenre(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    onGenreChange(
      value === "all" ? null : value === "unknown" ? "unknown" : value,
    );
  }

  function handleImdbRating(event: ChangeEvent<HTMLSelectElement>) {
    onImdbRatingChange(event.target.value as RatingFilterValue);
  }

  function handleAverageRating(event: ChangeEvent<HTMLSelectElement>) {
    onAverageRatingChange(event.target.value as RatingFilterValue);
  }

  return (
    <div className="filters">
      <label className="filters__field">
        <span>Genre</span>
        <select value={filterValue(genre)} onChange={handleGenre}>
          <option value="all">All genres</option>
          {genreOptions.map((entry) => (
            <option
              key={entry.genre === null ? "unknown" : entry.genre}
              value={entry.genre === null ? "unknown" : entry.genre}
            >
              {entry.genre === null ? "Unknown" : entry.genre}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__field">
        <span>Year</span>
        <select value={filterValue(year)} onChange={handleYear}>
          <option value="all">All years</option>
          {meta.moviesPerYear.map((entry) => (
            <option
              key={entry.year === null ? "unknown" : entry.year}
              value={entry.year === null ? "unknown" : entry.year}
            >
              {entry.year === null ? "Unknown" : entry.year}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__field">
        <span>IMDb Rating</span>
        <select value={imdbRating} onChange={handleImdbRating}>
          {RATING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {ratingDisplayName(option)}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__field">
        <span>Community Rating</span>
        <select value={averageRating} onChange={handleAverageRating}>
          {RATING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {ratingDisplayName(option)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="filters__clear filters__clear--small"
        onClick={onClearAll}
      >
        Clear all filters
      </button>
    </div>
  );
}

// Export rating filter utility for use in MoviesList
export function parseRatingFilter(raw: string | null): RatingFilterValue {
  if (!raw) return "all";
  if (RATING_OPTIONS.includes(raw as RatingFilterValue)) {
    return raw as RatingFilterValue;
  }
  return "all";
}

// Convert rating filter to server value
export function ratingToServerValue(
  rating: RatingFilterValue,
): number | null | undefined {
  switch (rating) {
    case "all":
      return undefined;
    case "unrated":
      return null;
    case "7+":
      return 7;
    case "8+":
      return 8;
    case "9+":
      return 9;
  }
}
