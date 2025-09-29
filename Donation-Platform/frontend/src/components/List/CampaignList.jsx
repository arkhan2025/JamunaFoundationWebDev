import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext.jsx";
import "../../App.css";
import "./CampaignList.css";

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [donationAmounts, setDonationAmounts] = useState({});
  const [messages, setMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns`);
        setCampaigns(res.data);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      }
    };
    fetchCampaigns();
  }, []);

  const handleAddToCart = async (campaign) => {
    if (!token) {
      return setMessages((prev) => ({
        ...prev,
        [campaign._id]: "Log in first to add in Cart for donation",
      }));
    }

    const rawAmount = donationAmounts[campaign._id];
    const amount = Number(rawAmount);

    if (!rawAmount || isNaN(amount) || amount <= 0) {
      return setMessages((prev) => ({
        ...prev,
        [campaign._id]: "Enter a valid donation amount",
      }));
    }

    try {
      await addToCart({
        campaignId: campaign._id,
        title: campaign.title,
        amount,
        location: campaign.location || "Unknown",
      });

      setDonationAmounts({ ...donationAmounts, [campaign._id]: "" });
      setMessages((prev) => ({
        ...prev,
        [campaign._id]: `Added $${amount} to cart`,
      }));
      setTimeout(
        () => setMessages((prev) => ({ ...prev, [campaign._id]: "" })),
        3000
      );
    } catch (err) {
      console.error("Error adding to cart:", err);
      setMessages((prev) => ({
        ...prev,
        [campaign._id]: "Failed to add to cart",
      }));
      setTimeout(
        () => setMessages((prev) => ({ ...prev, [campaign._id]: "" })),
        3000
      );
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      (c.location && c.location.toLowerCase().includes(query)) ||
      (c.cause && c.cause.toLowerCase().includes(query))
    );
  });

  return (
    <div className="page-container">
      <h2 className="section-title">Campaigns</h2>

      <div className="search-container">
        <input
          type="text"
          className="campaign-search"
          placeholder="Search by name, location or cause..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="campaign-list">
        {filteredCampaigns.length === 0 && <p>No campaigns found</p>}

        {filteredCampaigns.map((c) => (
          <div key={c._id} className="campaign-card">
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <p>
              <b>Cause:</b> {c.cause}
            </p>
            <p>
              <b>Goal (At least):</b> ${c.goalAmount}
            </p>
            <p>
              <b>Collected:</b> ${c.collectedAmount}
            </p>
            {c.location && (
              <p>
                <b>Location:</b> {c.location}
              </p>
            )}

            <div className="input-button-container">
              <input
                type="number"
                min="1"
                placeholder="Enter donation amount"
                value={donationAmounts[c._id] || ""}
                onChange={(e) =>
                  setDonationAmounts({
                    ...donationAmounts,
                    [c._id]: e.target.value,
                  })
                }
              />
              <button onClick={() => handleAddToCart(c)}>Add to Cart</button>
            </div>

            {messages[c._id] && (
              <div className="card-message">{messages[c._id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignList;
