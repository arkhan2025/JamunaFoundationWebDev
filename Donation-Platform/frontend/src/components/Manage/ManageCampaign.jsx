import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageCampaigns.css";

const ManageCampaigns = ({ token }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage("You must be logged in to view your campaigns.");
      setMessageType("error");
      return;
    }

    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL + "/campaigns/my-campaigns",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCampaigns(res.data || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load campaigns.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [token]);

  const handleUpdate = async (id, updatedFields) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/api/campaigns/${id}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Campaign updated successfully!");
      setMessageType("success");

      setCampaigns(campaigns.map(c => (c._id === id ? res.data : c)));
    } catch (err) {
      console.error(err);
      setMessage("Failed to update campaign.");
      setMessageType("error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await axios.delete(
        import.meta.env.VITE_API_URL + `/api/campaigns/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Campaign deleted successfully!");
      setMessageType("success");
      setCampaigns(campaigns.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete campaign.");
      setMessageType("error");
    }
  };

  return (
    <div className="manage-campaigns-container">
      <h2>Manage My Campaigns</h2>

      {message && <p className={`form-message ${messageType}`}>{message}</p>}
      {loading && <p>Loading...</p>}

      {campaigns.length === 0 && !loading && (
        <p className="empty-msg">No campaigns created yet.</p>
      )}

      <div className="campaign-list">
        {campaigns.map((campaign) => (
          <div key={campaign._id} className="campaign-card">
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p><strong>Cause:</strong> {campaign.cause}</p>
            <p><strong>Location:</strong> {campaign.location}</p>

            <div className="edit-fields">
              <label>
                Goal Amount:
                <input
                  type="number"
                  defaultValue={campaign.goalAmount}
                  onBlur={(e) =>
                    handleUpdate(campaign._id, { goalAmount: e.target.value })
                  }
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  defaultValue={campaign.endDate?.slice(0, 10)}
                  onBlur={(e) =>
                    handleUpdate(campaign._id, { endDate: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="actions">
              <button
                className="delete-btn"
                onClick={() => handleDelete(campaign._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCampaigns;
