import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./request.css";

export default function Request() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await axios.get(`https://community-project-tracker.onrender.com/api/requests/${id}`);
        setRequest(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load request");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleDecision = async (action) => {
    setMessage("");
    try {
      const res = await axios.post(`https://community-project-tracker.onrender.com/api/requests/${id}/${action}`);
      if (res.data.message === "approved") {
        setMessage("Request Approved");
      } else if (res.data.message === "rejected") {
        setMessage("Request Rejected");
      } else {
        setMessage("Action completed");
      }
      setTimeout(() => navigate("/home"), 2000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Action failed");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (loading) return <p>Loading request...</p>;
  if (!request) return <p>Request not found.</p>;

  return (
    <div className="request-container">
      {message && <div className="center-message">{message}</div>}

      <h2>Requesting User Details</h2>
      <div className="request-info">
        {request.photo && (
          <img
            src={`https://community-project-tracker.onrender.com/${request.photo}`}
            alt="User"
            onError={(e) => { e.target.src = "/default-user.png"; }}
          />
        )}
        <div>
          <p><strong>Name:</strong> {request.firstName} {request.lastName}</p>
          <p><strong>Email:</strong> {request.email}</p>
          <p><strong>Phone:</strong> {request.phone}</p>
          <p><strong>Address:</strong> {request.address}</p>
          <p><strong>Qualification:</strong> {request.qualification}</p>
          <p><strong>Applied As:</strong> {request.role}</p>
          <p><strong>Requested At:</strong> {new Date(request.requestedAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="actions">
        <button className="approve-btn" onClick={() => handleDecision("approve")}>Approve</button>
        <button className="reject-btn" onClick={() => handleDecision("reject")}>Reject</button>
      </div>
    </div>
  );
}
