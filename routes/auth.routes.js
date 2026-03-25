const router = require("express").Router();
const User = require("../models/User.model");
const { genSaltSync, hashSync, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middleware/middleware");

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const messages = [];

    const userEmail = await User.findOne({ email: req.body.email });
    if (userEmail) {
      return res
        .status(400)
        .json({ messages: ["We already have a user with that e-mail."] });
    }
    if (password.length < 8) {
      messages.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      messages.push("Password must have at least one uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      messages.push("Password must have at least one number");
    }
    if (messages.length > 0) {
      return res.status(400).json({ messages });
    }

    const salt = genSaltSync(11);
    const hashedPassword = hashSync(password, salt);
    await User.create({ firstName, lastName, email, password: hashedPassword });
    res.status(201).json({ status: 201, messages: ["User created"] });
  } catch (error) {
    res.status(500).json({ messages: ["Something went wrong"] });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const currentUser = await User.findOne({ email });

  if (currentUser) {
    if (compareSync(password, currentUser.password)) {
      const userCopy = { ...currentUser._doc };
      delete userCopy.password;
      const authToken = jwt.sign(
        {
          expiresIn: "6h",
          user: userCopy,
        },
        process.env.TOKEN_SECRET,
        {
          algorithm: "HS256",
        },
      );

      res.status(200).json({ status: 200, token: authToken });
    } else {
      res.status(400).json({ messages: ["Wrong password"] });
    }
  } else {
    res.status(404).json({ messages: ["No user with this email"] });
  }
});

router.get("/verify", isAuthenticated, async (req, res) => {
  const currentUser = await User.findById(req.payload.user._id);
  res
    .status(200)
    .json({ payload: req.payload, message: "Token OK", user: currentUser });
});

module.exports = router;
