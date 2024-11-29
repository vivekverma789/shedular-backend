const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/ScheduleController');
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add a schedule (publish)
router.post('/schedule/add', scheduleController.addSchedule);

router.get('/schedule/available', scheduleController.getAllSchedules);  // New route for fetching all schedules

// Route to remove a schedule
router.delete('/schedule/remove/:scheduleId', scheduleController.removeSchedule);

// Route to match schedules based on user preferences
router.post('/schedule/match', scheduleController.matchSchedules);

module.exports = router;
