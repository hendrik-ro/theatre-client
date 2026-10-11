import {
  createHashRouter,
  NavLink,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import LandingPage from "../features/movies/LandingPage";
import MoviesList from "../features/movies/MoviesList";
import MovieFormPage from "../features/movies/MovieFormPage";
import MovieDetail from "../features/movies/MovieDetail";
import Error404 from "../components/ErrorElement";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "app__navlink app__navlink--active" : "app__navlink";

const Layout = () => {
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
          <NavLink to="/movies/new" className={navLinkClass}>
            Add Movie
          </NavLink>
        </nav>
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
      children: [
        { index: true, element: <LandingPage /> },
        { path: "movies", element: <MoviesList /> },
        { path: "movies/new", element: <MovieFormPage /> },
        { path: "movies/:id", element: <MovieDetail /> },
        { path: "*", element: <Error404 /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
