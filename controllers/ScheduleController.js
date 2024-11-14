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
