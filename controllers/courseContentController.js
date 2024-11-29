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
    const { goal, duration, features, resources, courseInfo, subjects } = req.body;

    // Structure subjects and daily contents based on `columns`
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
// Controller to fetch leaves
exports.getLeaves = async (req, res) => {
  try {
    const userId = req.user._id; // Get the user ID from the authenticated user

    // Fetch the purchased schedule for the user
    const purchasedSchedule = await PurchasedSchedule.findOne({ userId });

    if (!purchasedSchedule) {
      return res.status(404).json({ message: "No purchased schedule found." });
    }

    // Send back the leaves taken by the user
    res.status(200).json({ leavesTaken: purchasedSchedule.leavesTaken });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves.", error: error.message });
  }
};

exports.requestLeave = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user._id;

    const purchasedSchedule = await PurchasedSchedule.findOne({ goalId, userId });
    if (!purchasedSchedule) {
      return res.status(404).json({ message: "Schedule not found for the given goal" });
    }

    const leaveDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const totalLeavesTaken = purchasedSchedule.leavesTaken.reduce((sum, leave) => sum + leave.days, 0);
    const maxLeaves = purchasedSchedule.maxLeaves || 10;
    const remainingLeaves = Math.max(maxLeaves - totalLeavesTaken, 0);

    if (leaveDays > remainingLeaves) {
      return res.status(400).json({ message: "Insufficient remaining leaves" });
    }

    purchasedSchedule.leavesTaken.push({ startDate, endDate, days: leaveDays });
    await purchasedSchedule.save();

    res.status(200).json({
      message: "Leave successfully recorded",
      remainingLeaves: remainingLeaves - leaveDays,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.cancelLeave = async (req, res) => {
  try {
    const { goalId, leaveId } = req.params;
    const userId = req.user._id;

    const purchasedSchedule = await PurchasedSchedule.findOne({ goalId, userId });
    if (!purchasedSchedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    const leave = purchasedSchedule.leavesTaken.id(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    const today = new Date();
    if (new Date(leave.startDate) <= today) {
      return res.status(400).json({ message: "Cannot cancel past or today's leave." });
    }

    purchasedSchedule.leavesTaken.pull(leaveId);
    await purchasedSchedule.save();

    const updatedRemainingLeaves = await purchasedSchedule.calculateRemainingLeaves(10);

    res.status(200).json({ message: "Leave cancelled successfully.", remainingLeaves: updatedRemainingLeaves });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling leave.", error: error.message });
  }
};

exports.getCourseContentByGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { goalId } = req.params;

    console.log("Fetching purchased schedule for user:", userId, "and goalId:", goalId);

    const purchasedSchedule = await PurchasedSchedule.findOne({ goalId, userId });
    if (!purchasedSchedule) {
      return res.status(404).json({ message: "No purchased schedule found for the given goal" });
    }

    const courseContent = await CourseContent.findOne({ _id: goalId });
    if (!courseContent) {
      return res.status(404).json({ message: "Course content not found for the given goal" });
    }

    // Check if today is within a leave period
    const today = new Date();
    const currentLeave = purchasedSchedule.leavesTaken.find(
      (leave) => today >= new Date(leave.startDate) && today <= new Date(leave.endDate)
    );

    if (currentLeave) {
      // If within a leave period, return leave details
      return res.status(200).json({
        message: "You are currently on leave.",
        leaveStart: currentLeave.startDate,
        leaveEnd: currentLeave.endDate,
        note: "You can resume your course after the leave period ends.",
      });
    }

    // Calculate total leaves taken
    const totalLeavesTaken = purchasedSchedule.leavesTaken.reduce((sum, leave) => sum + leave.days, 0);
    const maxLeaves = courseContent.maxLeaves || 10;
    const remainingLeaves = Math.max(maxLeaves - totalLeavesTaken, 0);

    // Determine the current day of the course
    const purchasedAt = moment(purchasedSchedule.purchasedAt);
    const lastAccessedDay = purchasedSchedule.lastAccessedDay || 1; // Default to Day 1 if not set
    const daysSincePurchase = moment().diff(purchasedAt, "days") + 1;

    // Resume from where the course was left before the leave
    const currentDay = Math.max(lastAccessedDay, daysSincePurchase);

    // Calculate total days of the course
    const totalDays = Math.max(
      ...courseContent.subjects.flatMap((subject) =>
        subject.dailyContents.map((content) => content.day)
      )
    );
    const remainingDays = totalDays - currentDay;

    // Filter today's content based on the current day
    const subjectsWithTodaysContent = courseContent.subjects
      .map((subject) => {
        const todaysContent = subject.dailyContents.find((content) => content.day === currentDay);
        return todaysContent
          ? { ...subject.toObject(), todaysContent }
          : null; // Exclude subjects with no content for the current day
      })
      .filter(Boolean);

    // Update the last accessed day in the database
    purchasedSchedule.lastAccessedDay = currentDay;
    await purchasedSchedule.save();

    // Respond with today's course content
    return res.status(200).json({
      goal: courseContent.goal,
      duration: courseContent.duration,
      maxLeaves,
      totalLeavesTaken,
      remainingLeaves,
      purchasedAt: purchasedSchedule.purchasedAt,
      totalDays,
      remainingDays: Math.max(remainingDays, 0),
      subjects: subjectsWithTodaysContent,
    });
  } catch (error) {
    console.error("Error fetching course content:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.getCourseContentByGoal = async (req, res) => {
//   try {
//     // Get the userId from the authenticated user (req.user._id)
//     const userId = req.user._id;
//     console.log("Request received for user:", userId, "to fetch course content for goalId:", req.params.goalId);
//     const { goalId } = req.params;

//     // Fetch purchased schedule details for the specific user and goal
//     console.log("Fetching purchased schedule for user:", userId, "and goalId:", goalId);
//     const purchasedSchedule = await PurchasedSchedule.findOne({ goalId, userId });
//     if (!purchasedSchedule) {
//       console.warn("No purchased schedule found for the given goalId and userId:", goalId, userId);
//       return res.status(404).json({ message: "No purchased schedule found for the given goal" });
//     }
//     console.log("Purchased schedule found:", purchasedSchedule);

//     // Fetch course content for the goalId
//     console.log("Fetching course content for goalId:", goalId);
//     const courseContent = await CourseContent.findOne({ _id: goalId });
//     if (!courseContent) {
//       console.warn("No course content found for the given goalId:", goalId);
//       return res.status(404).json({ message: "Course content not found for the given goal" });
//     }
//     console.log("Course content found:", courseContent);

//     // Calculate total leaves taken by the user
//     const totalLeavesTaken = purchasedSchedule.leavesTaken.reduce(
//       (sum, leave) => sum + leave.days,
//       0
//     );
//     console.log(`Total leaves taken: ${totalLeavesTaken}`);

//     // Calculate remaining leaves
//     const maxLeaves = courseContent.maxLeaves || 10; // Default maxLeaves to 10 if not defined
//     const remainingLeaves = Math.max(maxLeaves - totalLeavesTaken, 0);
//     console.log(`Remaining leaves: ${remainingLeaves}`);

//     // Calculate the day number since purchase
//     const purchasedAt = moment(purchasedSchedule.purchasedAt);
//     const today = moment();
//     const daysSincePurchase = today.diff(purchasedAt, "days") + 1; // Day 1 starts on purchase day
//     console.log(`Days since purchase: ${daysSincePurchase} (Purchased at: ${purchasedAt.format()})`);

//     // Calculate total days of the course (maximum day from all subjects)
//     const totalDays = Math.max(
//       ...courseContent.subjects.flatMap((subject) =>
//         subject.dailyContents.map((content) => content.day)
//       )
//     );
//     const remainingDays = totalDays - daysSincePurchase;
//     console.log(`Total days in course: ${totalDays}, Remaining days: ${remainingDays}`);

//     // Filter subjects for today's data only
//     console.log("Filtering today's subjects...");
//     const subjectsWithTodaysContent = courseContent.subjects
//       .map((subject) => {
//         const todaysContent = subject.dailyContents.find((content) => content.day === daysSincePurchase);
//         if (todaysContent) {
//           console.log(`Today's content found for subject '${subject.title}':`, todaysContent);
//           return {
//             ...subject.toObject(),
//             todaysContent, // Only include today's content
//           };
//         } else {
//           console.warn(`No content available for subject '${subject.title}' on day ${daysSincePurchase}`);
//           return null; // Exclude this subject if no content is found for today
//         }
//       })
//       .filter((subject) => subject !== null); // Remove null values (subjects without today's content)

//     // Respond with the filtered data
//     console.log("Responding with the filtered result...");
//     return res.status(200).json({
//       goal: courseContent.goal,
//       duration: courseContent.duration,
//       maxLeaves,
//       totalLeavesTaken,
//       remainingLeaves,
//       purchasedAt: purchasedSchedule.purchasedAt,
//       totalDays, // Total days for the course
//       remainingDays: Math.max(remainingDays, 0), // Ensure it doesn't go negative
//       subjects: subjectsWithTodaysContent, // Only today's subjects
//     });
//   } catch (error) {
//     console.error("Error fetching course content:", error.message, error.stack);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.getCourseContentByGoal = async (req, res) => {
//   try {
//     console.log("Request received to fetch course content for goalId:", req.params.goalId);
//     const { goalId } = req.params;

//     // Fetch purchased schedule details
//     console.log("Fetching purchased schedule for goalId:", goalId);
//     const purchasedSchedule = await PurchasedSchedule.findOne({ goalId });
//     if (!purchasedSchedule) {
//       console.warn("No purchased schedule found for the given goalId:", goalId);
//       return res.status(404).json({ message: "No purchased schedule found for the given goal" });
//     }
//     console.log("Purchased schedule found:", purchasedSchedule);

//     // Fetch course content
//     console.log("Fetching course content for goalId:", goalId);
//     const courseContent = await CourseContent.findOne({ _id: goalId });
//     if (!courseContent) {
//       console.warn("No course content found for the given goalId:", goalId);
//       return res.status(404).json({ message: "Course content not found for the given goal" });
//     }
//     console.log("Course content found:", courseContent);

//     // Calculate the day number since purchase
//     const purchasedAt = moment(purchasedSchedule.purchasedAt);
//     const today = moment();
//     const daysSincePurchase = today.diff(purchasedAt, 'days') + 1; // Day 1 starts on purchase day
//     console.log(`Days since purchase: ${daysSincePurchase} (Purchased at: ${purchasedAt.format()})`);

//     // Calculate total days of the course (maximum day from all subjects)
//     const totalDays = Math.max(
//       ...courseContent.subjects.flatMap(subject =>
//         subject.dailyContents.map(content => content.day)
//       )
//     );
//     const remainingDays = totalDays - daysSincePurchase;
//     console.log(`Total days in course: ${totalDays}, Remaining days: ${remainingDays}`);

//     // Filter subjects for today's data only
//     console.log("Filtering today's subjects...");
//     const subjectsWithTodaysContent = courseContent.subjects
//       .map(subject => {
//         const todaysContent = subject.dailyContents.find(content => content.day === daysSincePurchase);
//         if (todaysContent) {
//           console.log(`Today's content found for subject '${subject.title}':`, todaysContent);
//           return {
//             ...subject.toObject(),
//             todaysContent, // Only include today's content
//           };
//         } else {
//           console.warn(`No content available for subject '${subject.title}' on day ${daysSincePurchase}`);
//           return null; // Exclude this subject if no content is found for today
//         }
//       })
//       .filter(subject => subject !== null); // Remove null values (subjects without today's content)

//     // Respond with the filtered data
//     console.log("Responding with the filtered result...");
//     return res.status(200).json({
//       goal: courseContent.goal,
//       duration: courseContent.duration,
//       remainingLeaves: courseContent.maxLeaves,
//       // features: courseContent.features,
//       // resources: courseContent.resources,
//       // courseInfo: courseContent.courseInfo,
//       purchasedAt: purchasedSchedule.purchasedAt,
//       totalDays, // Total days for the course
//       remainingDays: Math.max(remainingDays, 0), // Ensure it doesn't go negative
//       subjects: subjectsWithTodaysContent, // Only today's subjects
//     });
//   } catch (error) {
//     console.error("Error fetching course content:", error.message, error.stack);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
