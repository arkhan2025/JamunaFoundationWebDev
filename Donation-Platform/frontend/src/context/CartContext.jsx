import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL; // must be https://your-backend.com/api

  // Fetch cart items from backend whenever token changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setCartItems([]); // clear cart if not logged in
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data); // always use backend response
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCartItems([]);
      }
    };
    fetchCart();
  }, [token, API_URL]);

  // Add item to cart
  const addToCart = async (item) => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${API_URL}/cart`,
        {
          campaignId: item.campaignId,
          title: item.title,
          amount: Number(item.amount),
          location: item.location || "Unknown",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend returns full updated cart, replace context
      setCartItems(res.data);
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err; // allow component to show message
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    if (!token || !cartItemId) return;
    try {
      await axios.delete(`${API_URL}/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  // Empty cart
  const emptyCart = async () => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
    } catch (err) {
      console.error("Error emptying cart:", err);
    }
  };

  // Clear cart after payment
  const clearCartAfterPayment = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        emptyCart,
        clearCartAfterPayment,
        cartCount: cartItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
