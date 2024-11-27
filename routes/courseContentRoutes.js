// routes/courseContentRoutes.js
const express = require('express');
const router = express.Router();
const courseContentController = require('../controllers/courseContentController');
router.get('/coursecontent/goals', courseContentController.getGoals);

router.post('/course-content', courseContentController.createCourseContent);
router.get('/course-content/:goalId', courseContentController.getCourseContentByGoal);

module.exports = router;
