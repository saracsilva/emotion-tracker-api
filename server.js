const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const authRoutes = require("./routes/auth.routes");
const entryRoutes = require("./routes/entry.routes");
const emotionRoutes = require("./routes/emotion.routes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Emotion Tracker API running" });
});

app.use("/auth", authRoutes);
app.use("/entries", entryRoutes);
app.use("/emotions", emotionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
