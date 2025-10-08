import React, { useState, useEffect } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import "./Checkout.css";

const stripeKey = import.meta.env.VITE_STRIPE_PK;
export const stripePromise = loadStripe(stripeKey);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#000",
      fontSize: "16px",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": { color: "#aaa" },
    },
    invalid: {
      color: "#ff4444",
      iconColor: "#ff4444",
    },
  },
};

const CheckoutForm = ({ cartItems, onSuccess, removeFromCart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    setSelectedItems(cartItems.map(() => false));
    setSelectAll(false);
  }, [cartItems]);

  const toggleSelect = (index) => {
    const updated = [...selectedItems];
    updated[index] = !updated[index];
    setSelectedItems(updated);
    setSelectAll(updated.every(Boolean));
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectedItems(cartItems.map(() => newValue));
    setSelectAll(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    try {
      if (!token) throw new Error("User not authenticated. Please login.");

      const selected = cartItems.filter((_, i) => selectedItems[i]);
      if (selected.length === 0) throw new Error("Select at least one item to pay for.");

      const successfulDonations = [];

      for (const item of selected) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/donations`,
          {
            campaignId: item.campaignId,
            amount: Number(item.amount),
            location: item.location || "Unknown",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 200 && item._id) {
          successfulDonations.push(item._id); 
        }
      }

      if (removeFromCart && successfulDonations.length > 0) {
        for (const id of successfulDonations) {
          await removeFromCart(id);
        }
      }

      setMessage("Payment successful! Donations recorded.");
      if (onSuccess) onSuccess(successfulDonations);
    } catch (err) {
      console.error("Checkout error:", err);
      const backendMsg = err.response?.data?.message || err.message || "Error processing payment.";
      setMessage(`Payment failed: ${backendMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item, i) => (selectedItems[i] ? sum + Number(item.amount) : sum),
    0
  );

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h2 className="checkout-title">Total: ${total}</h2>
      {message && <p className="checkout-message">{message}</p>}

      <div className="cart-selection">
        <label>
          <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /> Select All
        </label>
        <ul>
          {cartItems.map((item, index) => (
            <li key={item._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedItems[index] || false}
                  onChange={() => toggleSelect(index)}
                />{" "}
                {item.title} — ${item.amount} ({item.location})
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-container">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <button type="submit" className="checkout-button" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export { CheckoutForm };
