import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import api from "../services/api";
import "./profile.css";

export default function Profile() {
  const { user: authUser, token } = useContext(AuthContext);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return setLoading(false);
      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMe(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return <p>Loading profile...</p>;
  if (!me) return <p>Profile not found.</p>;

  return (
    <div className="page-container profile">
      <div className="profile-card">
        {me.photo && (
          <img
            src={`https://community-project-tracker.onrender.com/${me.photo}`}
            alt={`${me.firstName} ${me.lastName}`}
            onError={(e) => { e.target.src = "/default-user.png"; }}
          />
        )}
        <div>
        <p><strong>Name:</strong> {me.firstName} {me.lastName}</p>
        <p><strong>Email:</strong> {me.email}</p>
        <p><strong>Phone:</strong> {me.phone}</p>
        <p><strong>Address:</strong> {me.address}</p>
        <p><strong>Qualification:</strong> {me.qualification}</p>
        <p><strong>Role:</strong> {me.role}</p>
        <p><strong>Joined:</strong> {new Date(me.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
