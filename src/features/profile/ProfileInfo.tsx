import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import { friendlyError } from "../../api/errors";

export default function ProfileInfo() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setError(friendlyError(err, "Logout failed"));
    } finally {
      setPending(false);
    }
  }

  return (
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
      </div>
    </div>
  );
}
