import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./header.css";
import logo from "../../assets/AR.svg";

const Header = ({ user }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" />
      </div>

      <div className="header-center">
        {user ? "Next Gen Quiz" : "Next Gen Quiz"}
      </div>

      <nav className={`header-right ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <Link to="/dashboard">Home</Link>
            <Link to="/quizzes">Quiz List</Link>
            <Link to="/profile">Profile</Link>
            <button className="lo" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/quizzes">Quiz List</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        ☰
      </button>
    </header>
  );
};

export default Header;
