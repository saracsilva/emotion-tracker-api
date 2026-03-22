const router = require("express").Router();
const Entry = require("../models/Entry.model");
const isAuthenticated = require("../middleware/middleware");

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entries" });
  }
});

router.get("/:date", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.params;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const entry = await Entry.findOne({ date: { $gte: start, $lte: end } });
    if (!entry)
      return res.status(404).json({ message: "No entry for this date" });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entry" });
  }
});

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { emotions, reflection, journal } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await Entry.findOneAndUpdate(
      { date: today },
      { emotions, reflection, journal },
      { upsert: true, new: true },
    );
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Error saving entry" });
  }
});

router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const entry = await Entry.findByIdAndUpdate(id, body, { new: true });
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ message: "Error saving entry" });
  }
});

module.exports = router;
