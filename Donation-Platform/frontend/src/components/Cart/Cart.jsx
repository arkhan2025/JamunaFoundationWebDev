import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { CheckoutForm, stripePromise } from "../Checkout.jsx";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import "./Cart.css";

const Cart = () => {
  const { cartItems, setCartItems, removeFromCart, emptyCart } = useCart();
  const [message, setMessage] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const token = sessionStorage.getItem("token");
  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.amount), 0);

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data);
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };
    fetchCart();
  }, [token, setCartItems]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleRemove = async (id, title) => {
    if (!id) return;
    try {
      await removeFromCart(id);
      showMessage(`Removed "${title}" from cart`);
    } catch (err) {
      console.error("Error removing item:", err);
      showMessage("Failed to remove item");
    }
  };

  const handleEmpty = async () => {
    if (cartItems.length === 0) {
      showMessage("Cart is already empty");
      return;
    }
    try {
      await emptyCart();
      showMessage("Cart emptied");
    } catch (err) {
      console.error("Error emptying cart:", err);
      showMessage("Failed to empty cart");
    }
  };

  const handleCheckoutSuccess = async (successfulDonations) => {
    try {
      showMessage("Donation successful! Thank you for your support ❤️");
      setShowCheckout(false);
    } catch (err) {
      console.error("Error clearing donated items:", err);
    }
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
              <CheckoutForm
                cartItems={cartItems}
                onSuccess={handleCheckoutSuccess}
                removeFromCart={removeFromCart}
              />
            </Elements>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
