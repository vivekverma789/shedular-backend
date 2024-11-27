const mongoose = require("mongoose");

const PurchasedScheduleSchema = new mongoose.Schema(
  {
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User", // Reference to the User model
    // },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Goal", // Reference to a Goal model if applicable
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Schedule", // Reference to a Schedule model
    },
    goal: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    exam: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: { // New field to track completion status
      type: Boolean,
      default: false, // Assume the schedule is not completed when purchased
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchasedSchedule", PurchasedScheduleSchema);
