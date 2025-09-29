import express from "express";
import Campaign from "../models/Campaign.js";
import { verifyToken } from "./Auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { title, description, cause, location, goalAmount, endDate } = req.body;

  if (!title || !description || !cause || !location || !goalAmount || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newCampaign = new Campaign({
      title,
      description,
      cause,
      location,
      goalAmount,
      endDate,
      creator: req.user.id,
      collectedAmount: 0,
      donations: [],
    });

    await newCampaign.save();
    res.status(201).json({ message: "Campaign created successfully", campaign: newCampaign });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create campaign" });
  }
});

router.get("/my", verifyToken, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creator: req.user.id });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your campaigns" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, location, goalAmount, endDate } = req.body;

  try {
    const campaign = await Campaign.findOne({ _id: id, creator: req.user.id });
    if (!campaign) return res.status(404).json({ message: "Campaign not found or not authorized" });

    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (location) campaign.location = location;
    if (goalAmount) campaign.goalAmount = goalAmount;
    if (endDate) campaign.endDate = endDate;

    await campaign.save();
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: "Failed to update campaign" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findOneAndDelete({ _id: id, creator: req.user.id });
    if (!campaign) return res.status(404).json({ message: "Campaign not found or not authorized" });

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete campaign" });
  }
});

export default router;
