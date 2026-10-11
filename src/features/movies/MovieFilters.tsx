import type { ChangeEvent } from "react";
import type { MoviesMeta } from "../../types/movie";

export type YearFilter = number | "unknown" | null;
export type GenreFilter = string | "unknown" | null;

interface MovieFiltersProps {
  meta: MoviesMeta;
  year: YearFilter;
  genre: GenreFilter;
  onYearChange: (year: YearFilter) => void;
  onGenreChange: (genre: GenreFilter) => void;
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
  onYearChange,
  onGenreChange,
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
    </div>
  );
}
