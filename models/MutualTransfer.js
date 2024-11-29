const mongoose = require("mongoose");

const MutualTransferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  selectedGoal: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  employeeNo: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  post: {
    type: String,
    required: true,
  },
  currentPosting: {
    type: String,
    required: true,
  },
  desiredPosting: {
    type: String,
    required: true,
  },
  proofFilePath: {
    type: String,
    required: true,
  },
  additionalDetail: {
    type: String,
  },
  currentZone: {
    type: String,
  },
  currentDivision: {
    type: String,
  },
  desiredZone: {
    type: String,
  },
  desiredDivision: {
    type: String,
  },
  department: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add Conditional Validation for RRB Goal
MutualTransferSchema.pre("validate", function (next) {
  if (this.selectedGoal === "RRB") {
    if (!this.currentZone || !this.currentDivision || !this.desiredZone || !this.desiredDivision || !this.department) {
      return next(new Error("Missing required fields for RRB goal: currentZone, currentDivision, desiredZone, desiredDivision,department"));
    }
  }
  next();
});

module.exports = mongoose.model("MutualTransfer", MutualTransferSchema);
