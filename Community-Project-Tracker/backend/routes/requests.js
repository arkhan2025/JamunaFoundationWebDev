import express from "express";
import Request from "../models/request.js";
import User from "../models/user.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import multer from "multer";

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL || "dummy@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

router.get("/", async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching requests", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching request", error: err.message });
  }
});

// FIXED: handle file upload with multer
router.post("/", upload.single("photo"), async (req, res) => {
  const { firstName, lastName, email, password, phone, address, qualification, role } = req.body;
  const photo = req.file ? req.file.filename : ""; // optional photo

  try {
    const existing = await Request.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const newRequest = new Request({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      qualification,
      photo,
      role: role || "volunteer",
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: "Server error creating request", error: err.message });
  }
});

router.post("/:id/approve", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const passwordToUse = request.password || await bcrypt.hash("default123", 10);

    const user = new User({
      firstName: request.firstName || "N/A",
      lastName: request.lastName || "N/A",
      email: request.email,
      password: passwordToUse,
      phone: request.phone || "",
      address: request.address || "",
      qualification: request.qualification || "",
      role: request.role || "volunteer",
      photo: request.photo || "",
      availability: "available",
    });

    await user.save();
    await Request.findByIdAndDelete(req.params.id);

    try {
      await transporter.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: request.email,
        subject: "Registration Approved",
        text: `Hello ${request.firstName || "User"},\n\nYour registration as ${request.role || "volunteer"} has been approved. You can now login.\n\n- Community Tracker`,
      });
    } catch {}

    res.status(200).json({ message: "approved" });
  } catch (err) {
    res.status(500).json({ message: "Server error approving request", error: err.message });
  }
});

router.post("/:id/reject", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    await Request.findByIdAndDelete(req.params.id);

    try {
      await transporter.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: request.email,
        subject: "Registration Rejected",
        text: `Hello ${request.firstName || "User"},\n\nYour registration as ${request.role || "volunteer"} has been rejected.\n\n- Community Tracker`,
      });
    } catch {}

    res.status(200).json({ message: "rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error rejecting request", error: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status value" });

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    await request.save();
    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error updating status", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    await request.remove();
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting request", error: err.message });
  }
});

export default router;
