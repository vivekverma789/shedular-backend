const User = require("../models/User"); // Your user model

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure user is authenticated
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      phone: user.phone, // Ensure you have a `phone` field
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
