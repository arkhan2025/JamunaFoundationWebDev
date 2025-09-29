import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("birthday", birthday);
      formData.append("phone", phone);
      if (photo) {
        formData.append("photo", photo); 
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMessage(res.data.message || "Registration successful! Redirecting to login...");
      setMessageType("success");

      setName("");
      setEmail("");
      setPassword("");
      setBirthday("");
      setPhone("");
      setPhoto(null);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || "Registration failed. Try again.";
      setMessage(errorMsg);
      setMessageType("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

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

      <input
        type="date"
        placeholder="Birthday"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        required
      />

      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={(e) => setPhoto(e.target.files[0])}
      />

      <button type="submit">Register</button>

      {message && (
        <p className={`form-message ${messageType}`}>
          {message}
        </p>
      )}
    </form>
  );
};

export default Register;
