// controllers/courseContentController.js
const CourseContent = require('../models/CourseContent');
const PurchasedSchedule = require('../models/PurchasedSchedule');
const moment = require('moment'); // Use moment.js for date calculations

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

exports.getCourseContentByGoal = async (req, res) => {
  try {
    console.log("Request received to fetch course content for goalId:", req.params.goalId);
    const { goalId } = req.params;

    // Fetch purchased schedule details
    console.log("Fetching purchased schedule for goalId:", goalId);
    const purchasedSchedule = await PurchasedSchedule.findOne({ goalId });
    if (!purchasedSchedule) {
      console.warn("No purchased schedule found for the given goalId:", goalId);
      return res.status(404).json({ message: "No purchased schedule found for the given goal" });
    }
    console.log("Purchased schedule found:", purchasedSchedule);

    // Fetch course content
    console.log("Fetching course content for goalId:", goalId);
    const courseContent = await CourseContent.findOne({ _id: goalId });
    if (!courseContent) {
      console.warn("No course content found for the given goalId:", goalId);
      return res.status(404).json({ message: "Course content not found for the given goal" });
    }
    console.log("Course content found:", courseContent);

    // Calculate the day number since purchase
    const purchasedAt = moment(purchasedSchedule.purchasedAt);
    const today = moment();
    const daysSincePurchase = today.diff(purchasedAt, 'days') + 1; // Day 1 starts on purchase day
    console.log(`Days since purchase: ${daysSincePurchase} (Purchased at: ${purchasedAt.format()})`);

    // Calculate total days of the course (maximum day from all subjects)
    const totalDays = Math.max(
      ...courseContent.subjects.flatMap(subject =>
        subject.dailyContents.map(content => content.day)
      )
    );
    const remainingDays = totalDays - daysSincePurchase;
    console.log(`Total days in course: ${totalDays}, Remaining days: ${remainingDays}`);

    // Filter subjects for today's data only
    console.log("Filtering today's subjects...");
    const subjectsWithTodaysContent = courseContent.subjects
      .map(subject => {
        const todaysContent = subject.dailyContents.find(content => content.day === daysSincePurchase);
        if (todaysContent) {
          console.log(`Today's content found for subject '${subject.title}':`, todaysContent);
          return {
            ...subject.toObject(),
            todaysContent, // Only include today's content
          };
        } else {
          console.warn(`No content available for subject '${subject.title}' on day ${daysSincePurchase}`);
          return null; // Exclude this subject if no content is found for today
        }
      })
      .filter(subject => subject !== null); // Remove null values (subjects without today's content)

    // Respond with the filtered data
    console.log("Responding with the filtered result...");
    return res.status(200).json({
      goal: courseContent.goal,
      duration: courseContent.duration,
      // features: courseContent.features,
      // resources: courseContent.resources,
      // courseInfo: courseContent.courseInfo,
      purchasedAt: purchasedSchedule.purchasedAt,
      totalDays, // Total days for the course
      remainingDays: Math.max(remainingDays, 0), // Ensure it doesn't go negative
      subjects: subjectsWithTodaysContent, // Only today's subjects
    });
  } catch (error) {
    console.error("Error fetching course content:", error.message, error.stack);
    return res.status(500).json({ message: "Internal server error" });
  }
};
