const express = require("express");
const { getUserProfile } = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware"); // Ensure authentication

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
