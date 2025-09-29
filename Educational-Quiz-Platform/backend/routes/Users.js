import express from "express";
import multer from "multer";
import User from "../models/User.js";

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// User registration
router.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, password, role, profession, address, mobile, qualifications } = req.body;
    const photo = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      profession,
      address,
      mobile,
      qualifications,
      photo,
      attempts: [],
      participated_quiz: [],
    });

    await user.save();
    res.status(201).json({ message: "Registration successful!", userId: user._id });
  } catch (err) {
    console.error("❌ Error in register:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error("❌ Error in login:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get user by ID
router.get("/id/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user by ID:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get user by email
router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Add attempt – FIXED to store userAnswers correctly
router.put("/:userId/add-attempt", async (req, res) => {
  try {
    const { userId } = req.params;
    const attempt = req.body;

    console.log("Received attempt payload:", attempt);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure each question object has userAnswers array
    if (attempt.questions && Array.isArray(attempt.questions)) {
      attempt.questions = attempt.questions.map((q) => ({
        questionNumber: q.questionNumber,
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        correctAnswers: q.correctAnswers,
        userAnswers: Array.isArray(q.userAnswers) ? q.userAnswers : [], // ✅ fix here
        isCorrect: q.isCorrect,
      }));
    }

    // Replace existing attempt or push new
    const existingIndex = user.attempts.findIndex(a => a.quizId.toString() === attempt.quizId);
    if (existingIndex !== -1) {
      user.attempts[existingIndex] = attempt;
    } else {
      user.attempts.push(attempt);
    }

    // Track participated quizzes
    if (!user.participated_quiz.includes(attempt.quizId)) {
      user.participated_quiz.push(attempt.quizId);
    }

    console.log("Saving user with attempts:", user.attempts);
    await user.save();

    res.status(200).json({ message: "Attempt added successfully", attempt });
  } catch (err) {
    console.error("❌ Error adding attempt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
