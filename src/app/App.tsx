import { createHashRouter, Outlet, RouterProvider } from "react-router-dom";
import MoviesList from "../features/movies/MoviesList";
import MovieDetail from "../features/movies/MovieDetail";
import Error404 from "../components/ErrorElement";

const Layout = () => {
  return (
    <div className="app">
      <header className="app__header">
        <span className="app__title">Theatre</span>
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
        { index: true, element: <MoviesList /> },
        { path: "movies/:id", element: <MovieDetail /> },
        { path: "*", element: <Error404 /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
