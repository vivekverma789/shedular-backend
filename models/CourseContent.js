const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Topic name
  link: { type: String }, // Optional resource link
  pdf: { type: String }, // Optional PDF link
  description: { type: String }, // Description of the topic
  hours: { type: Number, required: true }, // Hours allocated for this topic
});


const dailyContentSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // Day number
  topics: [topicSchema] // Array of topics for the day
});

const subjectSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Subject name, e.g., "Math"
  dailyContents: [dailyContentSchema] // Daily schedule for the subject
});

const courseContentSchema = new mongoose.Schema({
  goal: { type: String, enum: ['SSC', 'RRB', 'BANKING'], required: true },
  duration: { type: String, enum: ['120-days', '150-days'], required: true },
  features: { type: String, required: true },
  resources: { type: String, required: true },
  courseInfo: { type: String, required: true },
  maxLeaves: { type: Number, default: 0 }, // Maximum leave days allowed for the course
  subjects: [subjectSchema], // List of subjects
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseContent', courseContentSchema);
