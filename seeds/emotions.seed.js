require("dotenv").config();
const connectDB = require("../db");
const Emotion = require("../models/Emotion.model");

const defaultEmotions = [
  { name: "happy", emoji: "😊", isDefault: true },
  { name: "sad", emoji: "😢", isDefault: true },
  { name: "anxious", emoji: "😟", isDefault: true },
  { name: "stressed", emoji: "😰", isDefault: true },
  { name: "excited", emoji: "🤩", isDefault: true },
  { name: "irritated", emoji: "😤", isDefault: true },
];

const seedEmotions = async () => {
  try {
    await connectDB();

    const count = await Emotion.countDocuments({ isDefault: true });
    if (count > 0) {
      console.log("Default emotions already seeded, skipping..");
      process.exit(0);
    }

    await Emotion.insertMany(defaultEmotions);
    console.log("Default emotions seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding emotions:", error);
    process.exit(1);
  }
};

seedEmotions();
