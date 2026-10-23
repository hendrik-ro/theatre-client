import { Outlet } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import SideNav from "./SideNav";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section className="page">
      <header className="page__header">
        <h1>Profile</h1>
        <p className="page__subtitle">Signed in as {user.username}.</p>
      </header>

      <div className="profile-layout">
        <SideNav />
        <div className="profile-content">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
