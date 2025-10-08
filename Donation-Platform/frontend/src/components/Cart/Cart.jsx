import React, { useEffect, useState } from "react";
import { CheckoutForm, stripePromise } from "../Checkout.jsx";
import { Elements } from "@stripe/react-stripe-js";
import api from "../../services/api.js"; // use the same api instance
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const token = sessionStorage.getItem("token");
  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.amount), 0);

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await api.get("/cart"); // api instance automatically adds token
        setCartItems(res.data);
      } catch (err) {
        console.error("Error loading cart:", err);
        setCartItems([]);
      }
    };
    fetchCart();
  }, [token]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  // Remove an item from cart
  const handleRemove = async (id, title) => {
    if (!id) return;
    try {
      await api.delete(`/cart/${id}`);
      setCartItems((prev) => prev.filter((item) => item._id !== id));
      showMessage(`Removed "${title}" from cart`);
    } catch (err) {
      console.error("Error removing item:", err);
      showMessage("Failed to remove item");
    }
  };

  // Empty entire cart
  const handleEmpty = async () => {
    if (cartItems.length === 0) {
      showMessage("Cart is already empty");
      return;
    }
    try {
      await api.delete("/cart"); // backend should clear cart
      setCartItems([]);
      showMessage("Cart emptied");
    } catch (err) {
      console.error("Error emptying cart:", err);
      showMessage("Failed to empty cart");
    }
  };

  // Called after successful checkout
  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setShowCheckout(false);
    showMessage("Donation successful! Thank you for your support ❤️");
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {message && <div className="cart-message">{message}</div>}

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <div>
                <h3>{item.title}</h3>
                <p>Amount: ${Number(item.amount)}</p>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemove(item._id, item.title)}
              >
                Remove
              </button>
            </div>
          ))}

          <p className="cart-total">
            <b>Total: ${totalAmount}</b>
          </p>

          <div className="cart-actions">
            <button className="cart-btn empty-btn" onClick={handleEmpty}>
              Empty Cart
            </button>
            <button className="cart-btn checkout-btn" onClick={() => setShowCheckout(true)}>
              Checkout
            </button>
          </div>

          {showCheckout && (
            <Elements stripe={stripePromise}>
              <CheckoutForm cartItems={cartItems} onSuccess={handleCheckoutSuccess} />
            </Elements>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
