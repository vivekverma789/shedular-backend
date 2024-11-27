const express = require("express");
const passport = require("passport");
require("../config/passportConfig");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Google Login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
      message: "Google Login Successful",
    });
  }
);

// Logout
router.get("/auth/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send("Error during logout");
    res.send("Logged out successfully");
  });
});

router.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    // Decode the token
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    const { sub: googleId, name, email, picture: profilePicture } = decoded;

    // Find or create user in the database
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        profilePicture,
        createdAt: new Date(),
      });
    }

    // Respond with user data
    res.json({
      success: true,
      user,
      message: "Google Login Successful",
    });
  } catch (error) {
    console.error("Error during Google Login:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
module.exports = router;
