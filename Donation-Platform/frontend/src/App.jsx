import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CampaignList from "./components/List/CampaignList.jsx";
import Cart from "./components/Cart/Cart.jsx";
import Register from "./components/Register/Register.jsx";
import Login from "./components/Login/Login.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import CreateCampaign from "./components/Create/CreateCampaign.jsx";
import Profile from "./components/Profile/Profile.jsx";
import './App.css';

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isLoggedIn = !!token;

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  return (
    <>
      <Navbar token={token} setToken={setToken} user={user} />

      <Routes>
        <Route path="/" element={<CampaignList token={token} />} />

        <Route
          path="/cart"
          element={isLoggedIn ? <Cart /> : <Navigate to="/login" />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login setToken={setToken} setUser={setUser} />}
        />

        <Route
          path="/create"
          element={isLoggedIn ? <CreateCampaign token={token} /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={isLoggedIn ? <Profile token={token} user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default App;
