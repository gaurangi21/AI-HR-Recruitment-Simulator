const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  matchScore: { type: Number, default: 0 },
  status: { type: String, enum: ['Applied', 'Screening', 'Interview scheduled', 'Rejected', 'Selected'], default: 'Applied' },
  interviewScore: { type: Number },
  interviewFeedback: { type: String },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
