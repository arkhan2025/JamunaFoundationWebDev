import express from "express";
import Cart from "../models/Cart.js";
import { verifyToken } from "./Auth.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    const cart = await Cart.find({ user: req.user.id });
    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Failed to fetch cart items" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { campaignId, title, amount, location } = req.body;

    if (!campaignId || !title || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "campaignId, title and valid amount are required" });
    }

    const existing = await Cart.findOne({ user: req.user.id, campaignId });
    if (existing) {
      existing.amount += Number(amount);
      await existing.save();
      return res.json(existing);
    }

    const newItem = await Cart.create({
      user: req.user.id,
      campaignId,
      title,
      amount: Number(amount),
      location: location || "Unknown",
    });

    res.json(newItem);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    const deleted = await Cart.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error("Error removing item from cart:", err);
    res.status(500).json({ message: "Failed to remove cart item" });
  }
});

router.delete("/", verifyToken, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    await Cart.deleteMany({ user: req.user.id });
    res.json({ message: "Cart emptied" });
  } catch (err) {
    console.error("Error emptying cart:", err);
    res.status(500).json({ message: "Failed to empty cart" });
  }
});

export default router;
