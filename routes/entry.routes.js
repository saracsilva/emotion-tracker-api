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

router.get("/streak", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload.sub;
    const entries = await Entry.find({
      user: userId,
      emotions: { $ne: [] },
    })
      .select("date")
      .sort({ date: -1 });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const entry of entries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const diffDays = Math.round(
        (today.getTime() - entryDate.getTime()) / MS_PER_DAY,
      );

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ messages: ["Error fetching entry"] });
  }
});

router.get("/:date", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.payload.sub;

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T00:00:00.000Z`);
    end.setDate(end.getDate() + 1);

    const entry = await Entry.findOne({
      date: { $gte: start, $lt: end },
      user: userId,
    }).populate("emotions");

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

    const entry = await Entry.create({
      date: new Date(),
      user: userId,
      emotions,
      reflection,
      journal,
    });

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
