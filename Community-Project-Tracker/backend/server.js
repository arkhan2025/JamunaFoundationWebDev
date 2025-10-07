import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import usersRouter from "./routes/users.js";
import projectsRouter from "./routes/projects.js";
import requestsRouter from "./routes/requests.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS: allow only the Netlify frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL, // should be https://community-project-tracker.netlify.app
    credentials: true,
  })
);

// Serve static uploads
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected to communityTracker database"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/requests", requestsRouter);

// Root route
app.get("/", (req, res) => res.send("API is running"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
