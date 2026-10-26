import {
  createHashRouter,
  NavLink,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import RatingsSync from "./RatingsSync";
import LandingPage from "../features/movies/LandingPage";
import MoviesList from "../features/movies/MoviesList";
import MovieFormPage from "../features/movies/MovieFormPage";
import MovieDetail from "../features/movies/MovieDetail";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import RequireAuth from "../features/auth/RequireAuth";
import ErrorElement from "../components/ErrorElement";
import ProfilePage from "../features/profile/ProfilePage";
import ProfileInfo from "../features/profile/ProfileInfo";
import ProfileWatchlist from "../features/profile/ProfileWatchlist";
import ProfileOptions from "../features/profile/ProfileOptions";

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
            <>
              <NavLink to="/profile/watchlist" className={navLinkClass}>
                Watchlist
              </NavLink>
              <NavLink to="/movies/new" className={navLinkClass}>
                Add Movie
              </NavLink>
            </>
          )}
        </nav>
        <div className="app__auth">
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
            {
              path: "profile",
              element: <ProfilePage />,
              children: [
                { index: true, element: <ProfileInfo /> },
                { path: "watchlist", element: <ProfileWatchlist /> },
                { path: "options", element: <ProfileOptions /> },
              ],
            },
          ],
        },
        { path: "*", element: <ErrorElement /> },
      ],
    },
  ]);
  return (
    <AuthProvider>
      <RatingsSync>
        <RouterProvider router={router} />
      </RatingsSync>
    </AuthProvider>
  );
}

export default App;
