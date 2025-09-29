import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = ({ token }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [activeTab, setActiveTab] = useState("donations");
  const [donations, setDonations] = useState([]);
  const [createdCampaigns, setCreatedCampaigns] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, campRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/donations/me`, {
          headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDonations(donRes.data || []);
        setCreatedCampaigns(campRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("phone", phone);
      if (photo) formData.append("photo", photo);

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/me`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setUser(res.data);
      setEditMode(false);
      setPhoto(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCreatedCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete campaign");
    }
  };

  const handleUpdateCampaign = async (id, field, value) => {
    try {
      const updated = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/campaigns/${id}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreatedCampaigns(prev => prev.map(c => (c._id === id ? updated.data : c)));
    } catch (err) {
      console.error(err);
      alert("Failed to update campaign");
    }
  };

  if (loading) return <p style={{ color: "#fff", textAlign: "center" }}>Loading...</p>;
  if (!user) return <p style={{ color: "#fff", textAlign: "center" }}>No user data found.</p>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <div className="profile-info">
        <img
          className="profile-photo"
          src={
            photo
              ? URL.createObjectURL(photo)
              : user.photo
              ? `${import.meta.env.VITE_API_URL}/uploads/${user.photo}`
              : "/default-profile.png"
          }
          alt="Profile"
        />

        <div className="profile-fields">
          <p><b>Name:</b> {user.name}</p>
          <p>
            <b>Email:</b>{" "}
            {editMode ? <input value={email} onChange={e => setEmail(e.target.value)} /> : user.email}
          </p>
          <p>
            <b>Phone:</b>{" "}
            {editMode ? <input value={phone} onChange={e => setPhone(e.target.value)} /> : user.phone || "-"}
          </p>
          <p><b>Birthday:</b> {user.birthday ? new Date(user.birthday).toLocaleDateString() : "-"}</p>
          {editMode && <input type="file" accept=".jpg,.jpeg,.png" onChange={e => setPhoto(e.target.files[0])} />}
          <button onClick={editMode ? handleSaveProfile : () => setEditMode(true)}>
            {editMode ? "Save Profile" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={activeTab === "donations" ? "active" : ""} onClick={() => setActiveTab("donations")}>
          Donation History
        </button>
        <button className={activeTab === "created" ? "active" : ""} onClick={() => setActiveTab("created")}>
          Created Campaigns
        </button>
      </div>

      <div className="profile-table">
        {activeTab === "donations" ? (
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Location</th>
                <th>Date</th>
                <th>Amount Donated</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan="4">No donations yet</td>
                </tr>
              ) : (
                donations.map(d => (
                  <tr key={d._id}>
                    <td>{d.campaignTitle}</td>
                    <td>{d.location}</td>
                    <td>{new Date(d.date).toLocaleDateString()}</td>
                    <td>${d.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Description</th>
                <th>Created On</th>
                <th>Goal</th>
                <th>Collected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {createdCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="7">No campaigns created</td>
                </tr>
              ) : (
                createdCampaigns.map(c => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>{c.location}</td>
                    <td>
                      <textarea
                        value={c.description}
                        onChange={e => handleUpdateCampaign(c._id, "description", e.target.value)}
                      />
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <input
                        type="number"
                        value={c.goalAmount}
                        onChange={e => handleUpdateCampaign(c._id, "goalAmount", e.target.value)}
                      />
                    </td>
                    <td>${c.collectedAmount}</td>
                    <td>
                      <input
                        type="date"
                        value={new Date(c.endDate).toISOString().split("T")[0]}
                        onChange={e => handleUpdateCampaign(c._id, "endDate", e.target.value)}
                      />
                      <button onClick={() => handleDeleteCampaign(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Profile;
