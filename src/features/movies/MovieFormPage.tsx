import { useNavigate } from "react-router-dom";
import { createMovie } from "../../api/movies";
import type { MovieInput } from "../../types/movie";
import MovieForm from "./MovieForm";

export default function MovieFormPage() {
  const navigate = useNavigate();

  async function handleCreate(input: MovieInput) {
    await createMovie(input);
    navigate("/movies");
  }

  return (
    <section className="page">
      <header className="page__header">
        <h1>Add a movie</h1>
        <p className="page__subtitle">Track a film you have watched.</p>
      </header>
      <div className="panel">
        <MovieForm submitLabel="Add movie" onSubmit={handleCreate} />
      </div>
    </section>
  );
}
