import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import "./Navbar.css";
import logo from "../../assets/Logo W.png";

const Navbar = ({ token, setToken, user }) => {
  const navigate = useNavigate();
  const { cartCount } = useCart(); // live cart count from context
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [menuHeight, setMenuHeight] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken("");
    navigate("/login");
  };

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuOpen ? menuRef.current.scrollHeight : 0);
    }
  }, [menuOpen]);

  return (
    <>
      <nav className="navbar">
        <img
          src={logo}
          alt="Logo"
          className="navbar-logo"
          onClick={() => navigate("/")}
        />

        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div ref={menuRef} className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <div className="navbar-links">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            {token && (
              <>
                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                  Cart ({cartCount || 0}) {/* live cart count */}
                </Link>
                <Link to="/create" onClick={() => setMenuOpen(false)}>
                  Create Campaign
                </Link>
              </>
            )}
          </div>

          <div className="navbar-auth">
            {token ? (
              <>
                <span
                  className="navbar-username"
                  onClick={() => handleNavigate("/profile")}
                >
                  {user?.name || "Profile"}
                </span>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => handleNavigate("/login")}>Login</button>
                <button onClick={() => handleNavigate("/register")}>Register</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Dynamic spacer for smooth menu animation */}
      <div style={{ height: menuHeight, transition: "height 0.3s ease" }}></div>
    </>
  );
};

export default Navbar;
