import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const itemsWithId = res.data.map((item) => ({
          ...item,
          _id: item._id,
        }));
        setCartItems(itemsWithId);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, [token]);

  const addToCart = async (item) => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_URL}/api/cart`,
        {
          campaignId: item.campaignId,
          title: item.title,
          amount: Number(item.amount),
          location: item.location || "Unknown",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newItem = { ...item, amount: Number(item.amount), _id: res.data._id };

      setCartItems((prev) => {
        const existing = prev.find((i) => i.campaignId === item.campaignId);
        if (existing) {
          return prev.map((i) =>
            i.campaignId === item.campaignId
              ? { ...i, amount: i.amount + Number(item.amount), _id: res.data._id }
              : i
          );
        }
        return [...prev, newItem];
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!cartItemId) return; 
    setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/api/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      if (err.response?.status === 404) return; 
      console.error("Error removing from cart:", err);
    }
  };

  const emptyCart = async () => {
    setCartItems([]);
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error emptying cart:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
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
