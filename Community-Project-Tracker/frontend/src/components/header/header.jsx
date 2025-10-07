import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "./Header.css";
import logo from "../../assets/AR.png";

export default function Header() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" />
        </Link>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {token && user ? (
            <>
              <Link to="/home">Home</Link>

              {user.role === "admin" && <Link to="/projects">Projects</Link>}

              <Link to="/profile">Profile</Link>

              <button className="btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
