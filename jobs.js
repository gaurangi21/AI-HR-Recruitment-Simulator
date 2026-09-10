const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get all jobs (public)
router.get('/', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// Get single job
router.get('/:id', async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
});

// Create job (admin only)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { title, department, level, skills } = req.body;
  if (!title || !skills || !skills.length) {
    return res.status(400).json({ message: 'Title and at least one skill are required' });
  }
  const job = await Job.create({ title, department, level, skills });
  res.status(201).json(job);
});

// Update job (admin only)
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
});

// Delete job (admin only)
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'Job deleted' });
});

module.exports = router;
