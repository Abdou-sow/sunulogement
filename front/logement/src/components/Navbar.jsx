import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useUser();

  return (
    <nav className="navbar">
      {/* logo = bouton Accueil */}
      <Link to="/" className="navbar-brand" aria-label="Accueil - SunuLogement">
        <img src="logo1.png" alt="SunuLogement" className="navbar-logo" />
        <span className="navbar-title">SunuLogement</span>
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
            <button onClick={logout} className="nav-btn logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
