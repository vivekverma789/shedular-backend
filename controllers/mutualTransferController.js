const MutualTransfer = require("../models/MutualTransfer");

// Save mutual transfer data
exports.saveMutualTransfer = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from middleware

    console.log(req.body)
    const {
      selectedGoal,
      fullName,
      employeeNo,
      mobileNumber,
      email,
      category,
      department,
      post,
      currentPosting,
      desiredPosting,
      additionalDetail,
      currentZone,
      currentDivision,
      desiredZone,
      desiredDivision,
    } = req.body;

    // Save file path if proofFile is uploaded
    const proofFilePath = req.file ? req.file.path : null;

    // Validate file upload
    if (!proofFilePath) {
      return res.status(400).json({ error: "Proof file is required." });
    }

    // Create a new MutualTransfer document
    const newTransfer = new MutualTransfer({
      userId,
      selectedGoal,
      fullName,
      employeeNo,
      mobileNumber,
      email,
      category,
      department,
      post,
      currentPosting,
      desiredPosting,
      proofFilePath,
      additionalDetail,
      currentZone,
      currentDivision,
      desiredZone,
      desiredDivision,
    });

    // Save to database
    await newTransfer.save();

    res.status(201).json({
      message: "Mutual transfer data saved successfully.",
      data: newTransfer,
    });
  } catch (error) {
    console.error("Error saving mutual transfer data:", error.message);
    res.status(500).json({ error: error.message });
  }
};
