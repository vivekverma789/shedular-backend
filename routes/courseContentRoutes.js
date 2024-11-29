// routes/courseContentRoutes.js
const express = require('express');
const router = express.Router();
const courseContentController = require('../controllers/courseContentController');
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/coursecontent/goals', courseContentController.getGoals);

router.post('/course-content', courseContentController.createCourseContent);
router.get('/course-content/:goalId', authMiddleware,courseContentController.getCourseContentByGoal);
router.post('/course-content/:goalId/request-leave', authMiddleware,courseContentController.requestLeave);
router.delete("/course-content/:goalId/cancel-leave/:leaveId",authMiddleware, courseContentController.cancelLeave);
router.get("/leaves",authMiddleware, courseContentController.getLeaves); // Route to fetch leaves

module.exports = router;
