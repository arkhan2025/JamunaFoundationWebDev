import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../auth.css";
import "./registration.css";

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [qualification, setQualification] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [role, setRole] = useState("volunteer");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setToast({ message: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("qualification", qualification);
      formData.append("role", role);
      if (photo) formData.append("photo", photo);

      const res = await axios.post("https://community-project-tracker.onrender.com/api/requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        setToast({ message: "Registration request sent successfully! Await admin approval.", type: "success" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setToast({
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to send registration request",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  // Toast auto-hide
  React.useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="auth-page">
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
      <form className="auth-card" onSubmit={submit} encType="multipart/form-data">
        <h2>Register</h2>

        <label>First Name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label>Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <label>Password (6 digits minimum)</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <label>Phone Number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          required
        />

        <label>Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <label>Educational Qualification</label>
        <input
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          required
        />

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="volunteer">Volunteer</option>
          <option value="doctor">Doctor</option>
        </select>

        <label>Photo (optional)</label>
        <div className="file-input">
          <input
            type="file"
            id="photo"
            onChange={(e) => {
              const file = e.target.files[0];
              setPhoto(file);
              setPhotoName(file ? file.name : "");
            }}
            accept="image/*"
          />
          
        </div>
            <div className="bt">
              <button className="btn-primary1" disabled={busy}>
          {busy ? "Submitting..." : "Register"}
        </button>
            </div>
        <p className="muted1">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
