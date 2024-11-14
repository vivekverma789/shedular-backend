// models/CourseContent.js
const mongoose = require('mongoose');

const dayContentSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // Day number, e.g., Day 1, Day 2
  content: { type: String, required: true } // Content for that day
});

const courseContentSchema = new mongoose.Schema({
  goal: { type: String, enum: ['SSC', 'RRB', 'Banking'], required: true }, // Modified to goal
  duration: { type: String, enum: ['120-days', '150-days'], required: true },
  features: { type: String, required: true },
  resources: { type: String, required: true },
  courseInfo: { type: String, required: true },
  subjects: [
    {
      title: { type: String, required: true }, // Subject name, e.g., "Math"
      dailyContents: [dayContentSchema] // Array of daily content entries for the subject
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseContent', courseContentSchema);
