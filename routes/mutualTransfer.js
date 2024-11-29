const express = require("express");
const router = express.Router();
const { saveMutualTransfer } = require("../controllers/mutualTransferController");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST route to save mutual transfer data
router.post("/mutual-transfer/save",authMiddleware, upload.single("proofFile"), saveMutualTransfer);

module.exports = router;
