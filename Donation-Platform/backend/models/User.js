import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    birthday: { type: Date },
    phone: { type: String, trim: true },
    photo: { type: String },
    cart: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
