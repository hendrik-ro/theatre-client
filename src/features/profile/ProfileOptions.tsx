import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "../../api/auth";
import { useAuth } from "../../app/AuthContext";
import { friendlyError } from "../../api/errors";

export default function ProfileOptions() {
  const { user, reload } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!user) return null;

  // After the early return, user is guaranteed to be non-null
  const nonNullUser = user;

  async function handleDelete() {
    if (pending) return;
    if (
      !window.confirm(
        `Delete your account, ${nonNullUser.username}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await deleteProfile(nonNullUser.id);
      // The auth cookies point at a deleted user now; reload swings the
      // context back to guest (the server rejects their tokens).
      await reload();
      navigate("/");
    } catch (err) {
      setError(friendlyError(err, "Failed to delete profile"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="panel">
      <h2>Options</h2>
      {error && <p className="form__error">{error}</p>}
      <button
        type="button"
        className="button--danger"
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "Deleting…" : "Delete profile"}
      </button>
    </div>
  );
}
