const mongoose = require("mongoose");

const PurchasedScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User model
    },
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
    lastAccessedDay: {
      type: Number,
      default: 1, // Start from Day 1 by default
    },    
    leavesTaken: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }, // Add endDate field
        days: { type: Number, required: true }, // Number of days taken for this leave
      },
    ],
  },
  { timestamps: true }
);

PurchasedScheduleSchema.methods.calculateRemainingLeaves = async function (maxLeaves) {
  const totalLeavesTaken = this.leavesTaken.reduce((sum, leave) => sum + leave.days, 0);
  return maxLeaves - totalLeavesTaken;
};
PurchasedScheduleSchema.methods.isDayFrozen = function (date) {
  return this.leavesTaken.some(
    (leave) => new Date(date) >= new Date(leave.startDate) && new Date(date) <= new Date(leave.endDate)
  );
};


module.exports = mongoose.model("PurchasedSchedule", PurchasedScheduleSchema);
