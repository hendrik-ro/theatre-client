import { NavLink } from "react-router-dom";

export default function SideNav() {
  return (
    <nav className="sidenav">
      <ul className="sidenav__list">
        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "sidenav__link sidenav__link--active" : "sidenav__link"
            }
          >
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile/watchlist"
            className={({ isActive }) =>
              isActive ? "sidenav__link sidenav__link--active" : "sidenav__link"
            }
          >
            Watchlist
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile/options"
            className={({ isActive }) =>
              isActive ? "sidenav__link sidenav__link--active" : "sidenav__link"
            }
          >
            Options
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
