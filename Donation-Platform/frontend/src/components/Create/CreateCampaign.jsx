import React, { useState } from "react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './CreateCampaign.css';

const CreateCampaign = ({ token, user }) => { 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cause, setCause] = useState("");
  const [location, setLocation] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!token) {
      setMessage("You must be logged in to create a campaign.");
      setMessageType("error");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/campaigns`,
        { title, description, cause, location, goalAmount, endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Campaign created successfully!");
      setMessageType("success");

      setTitle("");
      setDescription("");
      setCause("");
      setLocation("");
      setGoalAmount("");
      setEndDate("");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to create campaign.");
      setMessageType("error");
    }
  };

  return (
    <div className="create-campaign-container">
      <h2>Create Campaign</h2>
      <form className="create-campaign-form" onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input placeholder="Cause" value={cause} onChange={(e) => setCause(e.target.value)} required />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input placeholder="Goal Amount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} required />
        <input placeholder="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <button type="submit">Create Campaign</button>
      </form>
      {message && <p className={`form-message ${messageType}`}>{message}</p>}
    </div>
  );
};

export default CreateCampaign;
