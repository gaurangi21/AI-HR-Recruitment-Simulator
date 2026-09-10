const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, default: 'General' },
  level: { type: String, enum: ['Entry', 'Mid', 'Senior'], default: 'Entry' },
  skills: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
