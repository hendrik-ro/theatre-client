import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteProfile } from "../../api/auth";
import { getWatchlist, removeFromWatchlist } from "../../api/watchlists";
import { friendlyError } from "../../api/errors";
import type { Movie } from "../../types/movie";
import { useAuth } from "../../app/AuthContext";

// Placeholder profile: name, delete profile, logout. Profile editing
// arrives with the users phase.
export default function ProfilePage() {
  const { user, logout, reload } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [watchlist, setWatchlist] = useState<Movie[] | null>(null);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Page sits behind RequireAuth, so the session is already resolved;
  // failures here are genuine API failures, not a missing session.
  useEffect(() => {
    let cancelled = false;
    getWatchlist()
      .then((entries) => {
        if (!cancelled) setWatchlist(entries);
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
  }, []);

  if (!user) return null;

  async function handleRemoveFromWatchlist(movie: Movie) {
    if (removingId !== null) return;
    const previous = watchlist;
    setWatchlistError(null);
    setRemovingId(movie.id);
    setWatchlist(
      (list) => list?.filter((entry) => entry.id !== movie.id) ?? null,
    );
    try {
      await removeFromWatchlist(movie.id);
    } catch (err) {
      setWatchlist(previous);
      setWatchlistError(friendlyError(err, "Failed to update your watchlist"));
    } finally {
      setRemovingId(null);
    }
  }

  async function handleLogout() {
    if (pending) return;
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setError(friendlyError(err, "Logout failed"));
    }
  }

  async function handleDelete() {
    if (pending) return;
    if (
      !window.confirm(
        `Delete your account, ${user!.username}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await deleteProfile(user!.id);
      // The auth cookies point at a deleted user now; reload swings the
      // context back to guest (the server rejects their tokens).
      await reload();
      navigate("/");
    } catch (err) {
      setError(friendlyError(err, "Failed to delete profile"));
      setPending(false);
    }
  }

  return (
    <section className="page page--narrow">
      <header className="page__header">
        <h1>Profile</h1>
        <p className="page__subtitle">Signed in as {user.username}.</p>
      </header>
      <div className="panel">
        <dl className="detail">
          <div>
            <dt>Name</dt>
            <dd>{user.username}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
        </dl>
        {error && <p className="form__error">{error}</p>}
        <div className="profile__actions">
          <button type="button" onClick={handleLogout} disabled={pending}>
            Log out
          </button>
          <button
            type="button"
            className="button--danger"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Delete profile"}
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Watchlist</h2>
        {watchlistError && <p className="form__error">{watchlistError}</p>}
        {watchlist === null && !watchlistError && (
          <p className="muted">Loading…</p>
        )}
        {watchlist !== null && watchlist.length === 0 && (
          <p className="muted">
            Your watchlist is empty.{" "}
            <Link to="/">Browse movies to add some.</Link>
          </p>
        )}
        {watchlist !== null && watchlist.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Runtime</th>
                <th>IMDb</th>
                <th aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {watchlist.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <Link to={`/movies/${entry.id}`} className="table__link">
                      {entry.name}
                    </Link>
                  </td>
                  <td>{entry.year ?? "—"}</td>
                  <td>
                    {entry.runtime !== null ? `${entry.runtime} min` : "—"}
                  </td>
                  <td>{entry.imdbRating ?? "—"}</td>
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
      </div>
    </section>
  );
}
