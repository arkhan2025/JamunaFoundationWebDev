import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/Auth.js";
import campaignRoutes from "./routes/Campaigns.js";
import donationRoutes from "./routes/donations.js";
import cartRoutes from "./routes/Cart.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Verify that CLIENT_URL is correct
console.log("CORS allowed origin:", process.env.CLIENT_URL);

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL, // reads from .env
    credentials: true, // allow cookies and authorization headers
  })
);

// Body parser
app.use(express.json());

// Static uploads folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/cart", cartRoutes);

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
