import {
  createHashRouter,
  NavLink,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import LandingPage from "../features/movies/LandingPage";
import MoviesList from "../features/movies/MoviesList";
import MovieFormPage from "../features/movies/MovieFormPage";
import MovieDetail from "../features/movies/MovieDetail";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import ProfilePage from "../features/auth/ProfilePage";
import RequireAuth from "../features/auth/RequireAuth";
import ErrorElement from "../components/ErrorElement";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "app__navlink app__navlink--active" : "app__navlink";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__title">Theatre</span>
        <nav className="app__nav">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/movies" className={navLinkClass}>
            Library
          </NavLink>
          {user && (
            <NavLink to="/movies/new" className={navLinkClass}>
              Add Movie
            </NavLink>
          )}
        </nav>
        <div className="app__session">
          {user ? (
            <>
              <NavLink to="/profile" className={navLinkClass}>
                {user.username}
              </NavLink>
              <button
                type="button"
                className="app__logout"
                onClick={() => void logout()}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const router = createHashRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorElement />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
        { path: "movies", element: <MoviesList /> },
        { path: "movies/:id", element: <MovieDetail /> },
        {
          element: <RequireAuth />,
          children: [
            { path: "movies/new", element: <MovieFormPage /> },
            { path: "profile", element: <ProfilePage /> },
          ],
        },
        { path: "*", element: <ErrorElement /> },
      ],
    },
  ]);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
