// Controller to fetch purchased schedules, excluding completed ones
const PurchasedSchedule = require("../models/PurchasedSchedule");
const CourseContent = require("../models/CourseContent");

// Controller to handle the purchase of a schedule
exports.purchaseSchedule = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from middleware
    const { scheduleId, goalId, goal, duration, exam, features, price } = req.body;

    // Validation
    if (!userId || !scheduleId || !goalId || !goal || !duration || !exam || !features || !price) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Save the purchased schedule in the database
    const purchasedSchedule = new PurchasedSchedule({
      userId,
      scheduleId,
      goalId,
      goal,
      duration,
      exam,
      features,
      price,
    });

    await purchasedSchedule.save();

    res.status(201).json({
      message: "Schedule purchased successfully!",
      purchasedSchedule,
    });
  } catch (error) {
    console.error("Error purchasing schedule:", error.message);
    res.status(500).json({ error: "An error occurred while purchasing the schedule." });
  }
};
exports.getPurchasedSchedules = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from middleware
    const purchasedSchedules = await PurchasedSchedule.find({ userId, isCompleted: false });

    for (let schedule of purchasedSchedules) {
      const courseContent = await CourseContent.findById(schedule.goalId);

      if (courseContent) {
        const maxDaysInSubject = courseContent.subjects.reduce((maxDays, subject) => {
          const subjectDays = subject.dailyContents.length;
          return Math.max(maxDays, subjectDays);
        }, 0);

        // Calculate days elapsed since purchase, excluding leave days
        const purchasedDate = new Date(schedule.purchasedAt);
        const today = new Date();

        // Total days passed including leave days
        let totalDaysElapsed = Math.floor((today - purchasedDate) / (1000 * 60 * 60 * 24));
        const leaveDays = schedule.leavesTaken.reduce((sum, leave) => {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          const leaveDaysInRange = Math.max(
            0,
            Math.min(today, leaveEnd) - Math.max(purchasedDate, leaveStart)
          );
          return sum + Math.floor(leaveDaysInRange / (1000 * 60 * 60 * 24));
        }, 0);

        const adjustedDaysElapsed = totalDaysElapsed - leaveDays;

        // Mark as completed only if adjusted days elapsed exceeds course duration
        if (adjustedDaysElapsed >= maxDaysInSubject) {
          schedule.isCompleted = true;
          await schedule.save();
        }
      }
    }

    const activeSchedules = await PurchasedSchedule.find({ userId, isCompleted: false });

    res.status(200).json({
      purchasedSchedules: activeSchedules,
    });
  } catch (error) {
    console.error("Error fetching purchased schedules:", error.message);
    res.status(500).json({ error: "An error occurred while fetching purchased schedules." });
  }
};


// exports.getPurchasedSchedules = async (req, res) => {
//   try {
//     const userId = req.user._id; // Get user ID from middleware
//     const purchasedSchedules = await PurchasedSchedule.find({ userId, isCompleted: false });

//     // Process schedules to check completion
//     for (let schedule of purchasedSchedules) {
//       const courseContent = await CourseContent.findById(schedule.goalId);

//       if (courseContent) {
//         const maxDaysInSubject = courseContent.subjects.reduce((maxDays, subject) => {
//           const subjectDays = subject.dailyContents.length;
//           return Math.max(maxDays, subjectDays);
//         }, 0);

//         const daysPassed = Math.floor((new Date() - new Date(schedule.purchasedAt)) / (1000 * 60 * 60 * 24));

//         if (daysPassed >= maxDaysInSubject) {
//           schedule.isCompleted = true;
//           await schedule.save();
//         }
//       }
//     }

//     const activeSchedules = await PurchasedSchedule.find({ userId, isCompleted: false });

//     res.status(200).json({
//       purchasedSchedules: activeSchedules,
//     });
//   } catch (error) {
//     console.error("Error fetching purchased schedules:", error.message);
//     res.status(500).json({ error: "An error occurred while fetching purchased schedules." });
//   }
// };
