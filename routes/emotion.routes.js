const router = require("express").Router();
const Emotion = require("../models/Emotion.model");
const isAuthenticated = require("../middleware/middleware");

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const emotions = await Emotion.find({
      $or: [{ isDefault: true }, { user: req.payload.sub }],
    });

    if (!emotions || emotions.length === 0) {
      return res.status(404).json({ messages: ["No emotions found"] });
    }

    res.json(emotions);
  } catch (error) {
    res.status(500).json({ messages: ["Error fetching emotions"] });
  }
});

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { name, emoji } = req.body;
    const userId = req.payload.sub;
    const existingEmotion = await Emotion.findOne({
      name: name.toLowerCase(),
      $or: [{ isDefault: true }, { user: req.payload.sub }],
    });

    if (existingEmotion) {
      return res
        .status(400)
        .json({ messages: ["You already have an emotion with that name"] });
    }

    const emotion = await Emotion.create({ name, emoji, user: userId });
    res.status(201).json(emotion);
  } catch (error) {
    res.status(500).json({ messages: ["Error creating emotion"] });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.payload.sub;
    const emotion = await Emotion.findOneAndDelete({ _id: id, user: userId });

    if (!emotion) {
      return res.status(404).json({ messages: ["Emotion not found"] });
    }

    res.json({ messages: ["Emotion deleted"] });
  } catch (error) {
    res.status(500).json({ messages: ["Error deleting emotion"] });
  }
});

module.exports = router;
