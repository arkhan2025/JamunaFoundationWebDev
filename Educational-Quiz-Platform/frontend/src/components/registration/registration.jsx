import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./registration.css";

const Registration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
    profession: "",
    address: "",
    mobile: "",
    qualifications: "",
    photo: null,
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "photo") {
      setForm({ ...form, photo: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) formData.append(key, form[key]);
      });

      const res = await axios.post("https://educational-quiz-platform-l7r4.onrender.com/api/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Registration Successful! Redirecting to Login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Registration Failed. Please try again.");
    }
  };

  return (
    <div className="registration">
      <h2>Register</h2>
      {successMsg && <p className="success-msg">{successMsg}</p>}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="participant">Participant</option>
          <option value="publisher">Publisher</option>
        </select>
        <input
          name="profession"
          placeholder="Profession"
          value={form.profession}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <input
          name="mobile"
          placeholder="Mobile"
          value={form.mobile}
          onChange={handleChange}
        />
        <input
          name="qualifications"
          placeholder="Educational Qualifications"
          value={form.qualifications}
          onChange={handleChange}
        />
        <input
          type="file"
          name="photo"
          accept=".jpg,.jpeg,.png"
          onChange={handleChange}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Registration;
