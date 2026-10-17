import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "../../api/auth";
import { useAuth } from "../../app/AuthContext";

// Placeholder profile: name, delete profile, logout. Profile editing
// arrives with the users phase.
export default function ProfilePage() {
  const { user, logout, reload } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    if (pending) return;
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
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
      setError(err instanceof Error ? err.message : "Failed to delete profile");
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
    </section>
  );
}
