import express from "express";
import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import { verifyToken } from "./Auth.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { campaignId, amount, location } = req.body;
    const donorId = req.user.id;

    if (!campaignId || !mongoose.isValidObjectId(campaignId))
      return res.status(400).json({ message: "Invalid campaignId" });

    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount <= 0)
      return res.status(400).json({ message: "Invalid donation amount" });

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    campaign.collectedAmount += donationAmount;
    campaign.donations.push({
      donor: req.user.name || "Anonymous",
      amount: donationAmount,
      date: new Date(),
      location: location || "Unknown",
    });
    await campaign.save();

    await Donation.create({
      user: donorId,
      campaign: campaignId,
      amount: donationAmount,
      date: new Date(),
    });

    return res.status(200).json({
      message: "Donation recorded successfully",
      collectedAmount: campaign.collectedAmount,
      campaignId,
    });
  } catch (err) {
    console.error("Donation error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user.id })
      .populate("campaign", "title location")
      .sort({ date: -1 });

    const formatted = donations.map(d => ({
      _id: d._id,
      amount: d.amount,
      date: d.date,
      location: d.campaign?.location || "Unknown",
      campaignTitle: d.campaign?.title || "Unknown",
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("Fetch donations error:", err);
    return res.status(500).json({ message: "Failed to fetch donations" });
  }
});

export default router;
