import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";

// Wraps routes that need a logged-in user. Renders nothing while the
// initial session check is running, redirects guests to the login page,
// and otherwise renders the nested route.
export default function RequireAuth() {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
