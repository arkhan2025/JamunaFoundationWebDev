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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected to communityTracker database"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/requests", requestsRouter);

app.get("/", (req, res) => res.send("API is running"));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
