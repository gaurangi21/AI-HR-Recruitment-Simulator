const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { computeMatchScore } = require('../utils/aiEngine');

// Candidate applies to a job
router.post('/', verifyToken, requireRole('candidate'), async (req, res) => {
  const { jobId } = req.body;
  const job = await Job.findById(jobId);
  const candidate = await User.findById(req.user.id);
  if (!job || !candidate) return res.status(404).json({ message: 'Job or candidate not found' });

  const existing = await Application.findOne({ job: jobId, candidate: req.user.id });
  if (existing) return res.status(400).json({ message: 'Already applied to this job' });

  const matchScore = computeMatchScore(candidate.skills || [], job.skills);
  const application = await Application.create({ candidate: req.user.id, job: jobId, matchScore });
  res.status(201).json(application);
});

// Candidate: view own applications
router.get('/mine', verifyToken, requireRole('candidate'), async (req, res) => {
  const apps = await Application.find({ candidate: req.user.id }).populate('job');
  res.json(apps);
});

// Admin: view all applications, optionally filtered by job
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  const filter = req.query.jobId ? { job: req.query.jobId } : {};
  const apps = await Application.find(filter).populate('job').populate('candidate', '-password').sort({ matchScore: -1 });
  res.json(apps);
});

// Admin: update application status / interview results
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json(app);
});

module.exports = router;
