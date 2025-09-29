import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/register", upload.single("photo"), async (req, res) => {
  const { name, email, password, birthday, phone } = req.body;
  const photo = req.file ? req.file.filename : null;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, birthday, phone, photo });
    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Server error. Try again." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, birthday: user.birthday, phone: user.phone, photo: user.photo },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error. Try again." });
  }
});

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Not authenticated. Login required." });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalid or expired" });
    req.user = user; 
    next();
  });
};

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error. Try again." });
  }
});

router.put("/me", verifyToken, upload.single("photo"), async (req, res) => {
  const { email, phone } = req.body;
  const photo = req.file ? req.file.filename : undefined;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (photo) user.photo = photo;

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Server error. Try again." });
  }
});

export default router;
