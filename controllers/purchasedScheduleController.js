// Controller to fetch purchased schedules, excluding completed ones
const PurchasedSchedule = require("../models/PurchasedSchedule");
const CourseContent = require("../models/CourseContent");

// Controller to handle the purchase of a schedule
exports.purchaseSchedule = async (req, res) => {
  try {
    const { scheduleId, goalId, goal, duration, exam, features, price } = req.body;

    // Validation
    if (!scheduleId || !goalId || !goal || !duration || !exam || !features || !price) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Save the purchased schedule in the database
    const purchasedSchedule = new PurchasedSchedule({
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
    const purchasedSchedules = await PurchasedSchedule.find({ isCompleted: false });

    for (let schedule of purchasedSchedules) {
      const courseContent = await CourseContent.findById(schedule.goalId);

      if (courseContent) {
        // Iterate over the subjects and find the one with the maximum number of days
        const maxDaysInSubject = courseContent.subjects.reduce((maxDays, subject) => {
          const subjectDays = subject.dailyContents.length;
          return subjectDays > maxDays ? subjectDays : maxDays;
        }, 0);

        const currentDate = new Date();
        const purchasedDate = new Date(schedule.purchasedAt);
        const daysPassed = Math.floor((currentDate - purchasedDate) / (1000 * 60 * 60 * 24));

        console.log(`Schedule ID: ${schedule._id}`);
        console.log(`Goal ID: ${schedule.goalId}`);
        console.log(`Purchased Date: ${purchasedDate}`);
        console.log(`Current Date: ${currentDate}`);
        console.log(`Days Passed: ${daysPassed}`);
        console.log(`Course Duration (Days): ${maxDaysInSubject}`);

        if (daysPassed >= maxDaysInSubject) {
          schedule.isCompleted = true;
          await schedule.save();
          console.log(`Schedule ID: ${schedule._id} marked as completed.`);
        }
      }
    }

    const activeSchedules = await PurchasedSchedule.find({ isCompleted: false });

    res.status(200).json({
      purchasedSchedules: activeSchedules,
    });
  } catch (error) {
    console.error("Error fetching purchased schedules:", error.message);
    res.status(500).json({ error: "An error occurred while fetching purchased schedules." });
  }
};
