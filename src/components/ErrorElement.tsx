import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

// Renders for unknown routes (the "*" route, no route error attached) and
// for thrown route errors via errorElement. API-level 401/403 surface
// inline in pages; this covers navigation-level failures.
const MESSAGES: Record<number, { title: string; text: string }> = {
  401: {
    title: "Login required",
    text: "You need to be logged in to view this page.",
  },
  403: {
    title: "No access",
    text: "You do not have permission to view this page.",
  },
  404: {
    title: "Page Not Found",
    text: "The page you were looking for does not exist.",
  },
};

export default function ErrorElement() {
  const error = useRouteError();
  const navigate = useNavigate();
  const status = isRouteErrorResponse(error) ? error.status : 404;
  const info = MESSAGES[status] ?? {
    title: "Something went wrong",
    text: "An unexpected error occurred.",
  };

  return (
    <div className="errorPage">
      <h1>THEATRE</h1>
      <h2>
        {status} — {info.title}
      </h2>
      <p>{info.text}</p>
      <div>
        <button onClick={() => navigate("/")}>Back Home</button>
      </div>
    </div>
  );
}
