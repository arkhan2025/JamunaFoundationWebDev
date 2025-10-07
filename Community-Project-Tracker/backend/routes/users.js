import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.js";
import Request from "../models/request.js";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = "uploads/users";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post(
  "/register",
  upload.single("photo"),
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("phone").notEmpty(),
  body("address").notEmpty(),
  body("qualification").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { firstName, lastName, email, password, phone, address, qualification, role = "volunteer" } = req.body;

    try {
      const existingRequest = await Request.findOne({ email });
      const existingUser = await User.findOne({ email });
      if (existingRequest || existingUser) return res.status(400).json({ error: "Email already registered or request pending" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        address,
        qualification,
        role,
        photo: req.file ? req.file.path : undefined,
        assignedProjects: [],
      });

      await user.save();
      res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
      res.status(500).json({ error: "Internal server error", details: err.message });
    }
  }
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret123", { expiresIn: "1h" });

      res.json({
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Internal server error", details: err.message });
    }
  }
);

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    const user = await User.findById(decoded.id).select("-password").populate("assignedProjects");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token", details: err.message });
  }
});

router.get("/approved", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/byIds", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: "ids must be an array" });

    const users = await User.find({ _id: { $in: ids } }).select("firstName lastName phone");
    const formattedUsers = users.map((u) => ({ _id: u._id, name: `${u.firstName} ${u.lastName}`, phone: u.phone }));

    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

router.put("/:id/addProject", async (req, res) => {
  try {
    const { id } = req.params;
    let { projectId } = req.body;
    projectId = String(projectId);

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.assignedProjects.map(String).includes(projectId)) user.assignedProjects.push(projectId);
    user.availability = "occupied";
    await user.save();

    res.json({ message: "Project assigned successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

router.put("/:id/removeProject", async (req, res) => {
  try {
    const { id } = req.params;
    let { projectId } = req.body;
    projectId = String(projectId);

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Remove the project from assignedProjects
    user.assignedProjects = user.assignedProjects.map(String).filter((p) => p !== projectId);

    // Immediately set availability to available
    user.availability = "available";

    await user.save();
    res.json({ message: "Project removed and user marked available", user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

export default router;
