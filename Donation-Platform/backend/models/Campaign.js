import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    cause: { type: String, required: true },
    location: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    collectedAmount: { type: Number, default: 0 },
    endDate: { type: Date, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    donations: [
      {
        donor: { type: String, default: "Anonymous" }, 
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        location: { type: String, default: "Unknown" }
      }
    ]
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
