// controllers/courseContentController.js
const CourseContent = require('../models/CourseContent');

// controllers/courseContentController.js
exports.getGoals = async (req, res) => {
  try {
    // Fetch the course content with goal, duration, and the course ID (_id)
    const courseContent = await CourseContent.find({}, 'goal duration _id'); // Include _id for the course ID
    
    // Map the course content to include goal, duration, and courseId
    const goalsWithDuration = courseContent.map(content => ({
      goalId: content._id, // Add the course ID to the response
      goal: content.goal,
      duration: content.duration
    }));

    // Send the response with the course ID, goal, and duration
    res.status(200).json(goalsWithDuration);
  } catch (error) {
    console.error('Error fetching course content goals:', error);
    res.status(500).json({ error: 'Error fetching course content goals' });
  }
};



exports.createCourseContent = async (req, res) => {
  try {
    const { goal, duration, features, resources, courseInfo, columns } = req.body;

    // Structure subjects and daily contents based on `columns`
    const subjects = columns.slice(1).map((col) => ({
      title: col.title,
      dailyContents: col.rows.map((content, index) => ({
        day: index + 1,
        content: content || '', // Use an empty string if there's no content for the day
      })),
    }));

    const newCourseContent = new CourseContent({
      goal,
      duration,
      features,
      resources,
      courseInfo,
      subjects,
    });

    await newCourseContent.save();

    res.status(201).json({ message: 'Course content created successfully!', data: newCourseContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while creating course content' });
  }
};
