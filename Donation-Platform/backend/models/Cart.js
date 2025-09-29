import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    location: { type: String, default: "Unknown" },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
