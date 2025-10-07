import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  phone: { type: String, required: true },
  address: { type: String, required: true },
  qualification: { type: String, required: true },
  photo: { type: String },
  role: { 
    type: String, 
    enum: ["manager", "volunteer", "doctor"], 
    required: true 
  },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Request", requestSchema);
