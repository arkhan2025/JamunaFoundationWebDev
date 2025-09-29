import mongoose from "mongoose";
import dotenv from "dotenv";
import Campaign from "./models/Campaign.js";

dotenv.config();

const campaigns = [
  {
    title: "Tree Plantation Drive",
    description: "Planting trees in Dhaka to make our city greener.",
    cause: "Environment",
    location: "Dhaka",
    goalAmount: 1000,
    collectedAmount: 200,
    endDate: new Date("2025-12-31"),
  },
  {
    title: "Blood Donation Camp",
    description: "Organizing a camp to help patients in need of blood.",
    cause: "Health",
    location: "Chittagong",
    goalAmount: 500,
    collectedAmount: 150,
    endDate: new Date("2025-12-31"),
  },
  {
    title: "Community Library Setup",
    description: "Building a library for underprivileged children.",
    cause: "Education",
    location: "Sylhet",
    goalAmount: 800,
    collectedAmount: 400,
    endDate: new Date("2025-12-31"),
  },
  {
    title: "Clean Water Initiative",
    description: "Providing clean water to rural areas.",
    cause: "Health",
    location: "Barisal",
    goalAmount: 1200,
    collectedAmount: 600,
    endDate: new Date("2025-12-31"),
  },
  {
    title: "Animal Shelter Support",
    description: "Helping stray animals with food and medical care.",
    cause: "Animal Welfare",
    location: "Khulna",
    goalAmount: 700,
    collectedAmount: 350,
    endDate: new Date("2025-12-31"),
  },
  {
    title: "Women Empowerment Workshop",
    description: "Skill training and workshops for women in villages.",
    cause: "Social Welfare",
    location: "Rajshahi",
    goalAmount: 900,
    collectedAmount: 250,
    endDate: new Date("2025-12-31"),
  },
  {
    title: "Disaster Relief Fund",
    description: "Supporting families affected by recent floods.",
    cause: "Emergency",
    location: "Rangpur",
    goalAmount: 1500,
    collectedAmount: 700,
    endDate: new Date("2025-12-31"),
  },
  {
    title: "City Blood Drive",
    description: "Join our blood drive to save lives. Donate blood and help patients in need across the city.",
    cause: "Health",
    location: "Dhaka",
    goalAmount: 1000,
    collectedAmount: 300,
    endDate: new Date("2025-12-31"),
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected...");

    await Campaign.deleteMany();

    const inserted = await Campaign.insertMany(campaigns);

    console.log("Campaigns seeded successfully!");
    console.log("Inserted campaign IDs:");
    inserted.forEach((c) => console.log(c._id));

    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding error:", err);
    mongoose.connection.close();
  }
};

seedDB();
