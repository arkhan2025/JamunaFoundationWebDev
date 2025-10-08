import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.email) return;

    axios
      .get(`https://educational-quiz-platform-l7r4.onrender.com/api/users/${storedUser.email}`)
      .then((res) => setUserData(res.data))
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, []);

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div className="profile">
      <h2>Profile</h2>
      <div className="profile-card">
        {userData.photo && (
          <img
            src={`https://educational-quiz-platform-l7r4.onrender.com/${userData.photo.replace("\\", "/")}`}
            alt={userData.name}
            className="profile-photo"
          />
        )}
        <div className="profile-info">
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Role:</strong> {userData.role}</p>
          <p><strong>Profession:</strong> {userData.profession}</p>
          <p><strong>Address:</strong> {userData.address}</p>
          <p><strong>Mobile:</strong> {userData.mobile}</p>
          <p><strong>Qualifications:</strong> {userData.qualifications}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
