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
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(401).json({ messages: ["Invalid email or password"] });
    }

    const isValidPassword = compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ messages: ["Invalid email or password"] });
    }

    const authToken = jwt.sign(
      { sub: user._id, email: user.email },
      process.env.TOKEN_SECRET,
      { algorithm: "HS256", expiresIn: "6h" },
    );

    return res.status(200).json({ token: authToken });
  } catch (error) {
    return res.status(500).json({ messages: ["Something went wrong"] });
  }
});

router.get("/verify", isAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findById(req.payload.sub);
    res
      .status(200)
      .json({ payload: req.payload, message: "Token OK", user: currentUser });
  } catch (error) {
    res.status(500).json({ messages: ["Something went wrong"] });
  }
});

module.exports = router;
