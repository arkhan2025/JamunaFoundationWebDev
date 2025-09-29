import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [roleChoice, setRoleChoice] = useState([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser?._id) {
      setUser(savedUser);
      navigate("/dashboard");
    }
  }, [navigate, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setRoleChoice([]);

    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      setUserId(res.data._id);

      if (res.data.roles && res.data.roles.length > 1) {
        setRoleChoice(res.data.roles);
        setUserName(res.data.name);
      } else {
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          role: res.data.role,
          email: res.data.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("showWelcome", "true");
        setUser(userData);
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  const handleRoleSelect = (role) => {
    const userData = {
      _id: userId,
      name: userName,
      role,
      email,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("showWelcome", "true");
    setUser(userData);
    navigate("/dashboard");
  };

  return (
    <div className="login">
      <h2>Login</h2>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      {roleChoice.length > 0 ? (
        <div>
          <p>Multiple roles found. Choose which role to login as:</p>
          {roleChoice.map((r, i) => (
            <button key={i} onClick={() => handleRoleSelect(r)}>
              {r}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
};

export default Login;
