import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await login({ username, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setPending(false);
    }
  }

  return (
    <section className="page page--narrow">
      <header className="page__header">
        <h1>Log in</h1>
        <p className="page__subtitle">Welcome back.</p>
      </header>
      <div className="panel">
        <form className="form" onSubmit={handleSubmit}>
          {error && <p className="form__error">{error}</p>}
          <label className="form__field">
            <span>Username</span>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="form__field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" disabled={pending}>
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="muted">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
}
