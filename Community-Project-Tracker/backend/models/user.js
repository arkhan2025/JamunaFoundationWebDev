import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  qualification: { type: String, required: true },
  photo: { type: String },
  role: {
    type: String,
    enum: ["admin", "manager", "volunteer", "doctor"],
    default: "volunteer"
  },
  availability: {
    type: String,
    enum: ["available", "occupied"],
    default: "available"
  },
  assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
