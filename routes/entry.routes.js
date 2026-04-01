const router = require("express").Router();
const Entry = require("../models/Entry.model");
const isAuthenticated = require("../middleware/middleware");

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload.sub;
    const entries = await Entry.find({ user: userId });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ messages: ["Error fetching entries"] });
  }
});

router.get("/:date", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.payload.sub;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const entry = await Entry.findOne({
      date: { $gte: start, $lte: end },
      user: userId,
    });
    if (!entry)
      return res.status(404).json({ messages: ["No entry for this date"] });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ messages: ["Error fetching entry"] });
  }
});

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { emotions, reflection, journal } = req.body;
    const userId = req.payload.sub;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await Entry.findOneAndUpdate(
      { date: today, user: userId },
      { $set: { emotions, reflection, journal } },
      { upsert: true, returnDocument: "after" },
    );
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ messages: ["Error saving entry"] });
  }
});

router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const entry = await Entry.findByIdAndUpdate(
      { _id: id, user: req.payload.sub },
      body,
      { new: true },
    );
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ messages: ["Error saving entry"] });
  }
});

module.exports = router;
