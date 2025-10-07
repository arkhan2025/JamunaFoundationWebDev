import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";

const MONGO_URI =
  "mongodb+srv://arkhan:zayed@cluster0.dzoqlgy.mongodb.net/communityTracker?retryWrites=true&w=majority&appName=Cluster0";

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const adminEmail = "ar.khan.zayed2000@gmail.com";
    const adminPassword = "zayed";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists. Skipping creation.");
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const admin = new User({
        firstName: "AR",
        lastName: "Khan",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        phone: "+8801727671870",
        address: "Dhaka, Bangladesh",
        qualification: "Bachelor's Degree",
        createdAt: new Date(),
      });

      await admin.save();
      console.log("Admin created successfully!");
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("Error creating admin:", err);
  }
}

createAdmin();
