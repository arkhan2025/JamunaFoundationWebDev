import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch full cart
  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (item) => {
    if (!token) return;
    try {
      await axios.post(
        `${API_URL}/cart`,
        {
          campaignId: item.campaignId,
          title: item.title,
          amount: Number(item.amount),
          location: item.location || "Unknown",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart(); // fetch full cart after addition
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart(); // fetch updated cart after removal
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const emptyCart = async () => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]); // clear local state
    } catch (err) {
      console.error("Error emptying cart:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        emptyCart,
        cartCount: cartItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
