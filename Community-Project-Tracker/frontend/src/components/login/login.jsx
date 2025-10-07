import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginReq } from "../services/authServices";
import { AuthContext } from "../AuthContext";
import "../auth.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await loginReq({ email: email.trim(), password: password.trim() });
      const token = res.data.token;
      if (!token) throw new Error("Login failed");
      await login(token);
      navigate("/home");
    } catch (error) {
      setErr(
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        "Login failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Login</h2>
        {err && <div className="error">{err}</div>}
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <div className="bt">
          <button className="btn-primary1" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
        </div>
        <p className="muted1">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
