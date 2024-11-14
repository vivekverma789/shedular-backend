const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseContent', required: true },
  exam: { type: String, enum: ['CGL', 'CPO', 'CHSL', 'MTS', 'GD', 'NTPC', 'ALP', 'JE', 'Group-D', 'PO', 'Clerk'], required: true },
  category: { type: String, enum: ['FRESHER', 'REPEATER', 'BOTH'], required: true },
  hrsanddays: { type: String, enum: ['<5', '>5'], required: true },
  stage: { type: String, enum: ['PRELIMS', 'MAINS', 'PRELIMS+MAINS'], required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
