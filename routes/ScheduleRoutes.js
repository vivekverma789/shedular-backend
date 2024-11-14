const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/ScheduleController');

// Route to add a schedule (publish)
router.post('/schedule/add', scheduleController.addSchedule);

router.get('/schedule/available', scheduleController.getAllSchedules);  // New route for fetching all schedules

// Route to remove a schedule
router.delete('/schedule/remove/:scheduleId', scheduleController.removeSchedule);

module.exports = router;
