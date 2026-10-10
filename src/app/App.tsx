import { createHashRouter, Outlet, RouterProvider } from "react-router-dom";
import Home from "../features/home/Home";
import Error404 from "../components/ErrorElement";

const Layout = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};

function App() {
  const router = createHashRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "*", element: <Error404 /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
