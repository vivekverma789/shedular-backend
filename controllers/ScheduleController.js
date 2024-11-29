const CourseContent = require('../models/CourseContent');
const Schedule = require('../models/Schedule');
// Add a new schedule (publish)
exports.addSchedule = async (req, res) => {
  try {
    console.log(req.body)
    const scheduleData = req.body;
    const newSchedule = await Schedule.create(scheduleData);
    res.status(201).json({ message: 'Schedule published successfully!', data: newSchedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error while adding schedule' });
  }
};
// Controller: ScheduleController.js

exports.getAllSchedules = async (req, res) => {
  try {
    // Populate the 'goalId' field with the related 'CourseContent' data
    const schedules = await Schedule.find().populate('goalId', 'goal duration');
    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error while fetching schedules' });
  }
};


// Remove a schedule
exports.removeSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const schedule = await Schedule.findByIdAndDelete(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.status(200).json({ message: 'Schedule removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error while removing schedule' });
  }
};

// Match schedules based on user preferences
// exports.matchSchedules = async (req, res) => {
//   const { goal, exam, category, hrsanddays, stage, duration } = req.body;

//   console.log("Request Body:", req.body);

//   try {
//     // Fetch the matching CourseContent based on goal and duration
//     const courseContent = await CourseContent.findOne({ goal, duration });

//     if (!courseContent) {
//       return res.status(404).json({ error: "No course content matches the selected duration." });
//     }

//     const goalId = courseContent._id;

//     // Fetch schedules related to the goalId
//     const schedules = await Schedule.find({ goalId });

//     if (!schedules.length) {
//       return res.status(404).json({ error: "No schedules found for the selected goal." });
//     }

//     // Prepare the response as sets combining data from Schedule and CourseContent
//     const response = schedules.map(schedule => ({
//       goalId: schedule.goalId,
//       duration: courseContent.duration, // From CourseContent
//       exam: schedule.exam, // From Schedule
//       features: courseContent.features.split(',').map(feature => feature.trim()), // Assuming features are comma-separated
//       price: schedule.price, // From Schedule
//     }));

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching schedules and course content:", error.message);
//     res.status(500).json({ error: "Error fetching matched schedules and course content." });
//   }
// };


exports.matchSchedules = async (req, res) => {
  const { goal, exam, category, hrsanddays, stage, duration } = req.body;

  console.log("Request Bodys:", req.body);

  try {
    // Fetch the matching CourseContent based on goal and duration
    const courseContent = await CourseContent.findOne({ goal, duration });

    if (!courseContent) {
      console.log("notdounf")
      return res.status(404).json({ error: "No course content matches the selected duration." });
    }

    const goalId = courseContent._id;

    // Fetch schedules related to the goalId
    const schedules = await Schedule.find({});

    if (!schedules.length) {
      return res.status(404).json({ error: "No schedules found for the selected goal." });
    }

    // Custom Schedule: Exact match with the provided criteria
    const customSchedule = schedules
      .filter(
        (schedule) =>
          schedule.exam === exam &&
          schedule.category === category &&
          schedule.hrsanddays === hrsanddays &&
          schedule.stage === stage
      )
      .map((schedule) => ({
        id: schedule._id,
        goalId: schedule.goalId,
        goal: schedule.goal,
        duration: courseContent.duration,
        exam: schedule.goal + " " + schedule.exam,
        features: courseContent.features.split(",").map((feature) => feature.trim()),
        price: schedule.price,
      }));

    // Similar Schedules: All schedules with the same goal excluding the custom schedule
    const similarSchedules = schedules
      .filter((schedule) => schedule.goal === goal && (!customSchedule.length || schedule._id.toString() !== customSchedule[0].id.toString()))
      .map((schedule) => ({
        id: schedule._id,
        goalId: schedule.goalId,
        goal: schedule.goal,
        duration: courseContent.duration,
        exam: schedule.goal + " " + schedule.exam,
        features: courseContent.features.split(",").map((feature) => feature.trim()),
        price: schedule.price,
      }));

    // Other Exams: Schedules with different goals
    const otherExams = schedules
      .filter((schedule) => schedule.goal !== goal)
      .map((schedule) => ({
        id: schedule._id,
        goalId: schedule.goalId,
        goal: schedule.goal,
        duration: courseContent.duration,
        exam: schedule.goal + " " + schedule.exam,
        features: courseContent.features.split(",").map((feature) => feature.trim()),
        price: schedule.price,
      }));

    // Prepare the response
    const response = {
      customSchedule: customSchedule.length ? customSchedule[0] : null,
      similarSchedules,
      otherExams,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching schedules and course content:", error.message);
    res.status(500).json({ error: "Error fetching matched schedules and course content." });
  }
};
