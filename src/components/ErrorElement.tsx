import { useNavigate } from "react-router-dom";

export default function Error404() {
  const navigate = useNavigate();

  return (
    <div className="errorPage">
      <div className="errorPage">
        <h1>Falstaff</h1>
        <h2>Page Not Found</h2>
        <p>The page you were looking for does not exist.</p>
      </div>
      <div>
        <button onClick={() => navigate("/")}>Back Home</button>
      </div>
    </div>
  );
}
