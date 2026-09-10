const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

// Admin: list all candidates
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  const candidates = await User.find({ role: 'candidate' }).select('-password');
  res.json(candidates);
});

// Get own profile
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update own profile / resume skills (simulated resume parsing: client sends parsed skills)
router.put('/me', verifyToken, async (req, res) => {
  const { name, skills } = req.body;
  const update = {};
  if (name) update.name = name;
  if (skills) update.skills = skills;
  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
  res.json(user);
});

module.exports = router;
