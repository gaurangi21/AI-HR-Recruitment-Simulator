const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  computeMatchScore, missingSkills, matchingSkills,
  recommendationFor, roadmapFor, randomQuestion, evaluateAnswer
} = require('../utils/aiEngine');

// Admin: rank all candidates against a given job
router.get('/match/:jobId', verifyToken, requireRole('admin'), async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const candidates = await User.find({ role: 'candidate' }).select('-password');
  const ranked = candidates
    .map(c => {
      const score = computeMatchScore(c.skills, job.skills);
      return {
        candidate: { id: c._id, name: c.name, email: c.email, skills: c.skills },
        score,
        overlap: matchingSkills(c.skills, job.skills),
        recommendation: recommendationFor(score)
      };
    })
    .sort((a, b) => b.score - a.score);

  res.json({ job: job.title, ranked });
});

// Candidate: skill gap analysis against a job
router.get('/skill-gap/:jobId', verifyToken, requireRole('candidate'), async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  const user = await User.findById(req.user.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const missing = missingSkills(user.skills, job.skills);
  const roadmap = missing.map(skill => ({ skill, tip: roadmapFor(skill) }));

  res.json({
    job: job.title,
    have: matchingSkills(user.skills, job.skills),
    missing,
    roadmap
  });
});

// Mock interview: get a random question
router.get('/mock-interview/question', verifyToken, (req, res) => {
  res.json({ question: randomQuestion() });
});

// Mock interview: submit an answer for evaluation
router.post('/mock-interview/evaluate', verifyToken, (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ message: 'Answer is required' });
  const result = evaluateAnswer(answer);
  res.json(result);
});

// Simple HR chatbot
router.post('/chatbot', verifyToken, (req, res) => {
  const message = (req.body.message || '').toLowerCase();
  let reply;
  if (message.includes('status')) reply = 'Check the "My Applications" endpoint for your current stage and match scores.';
  else if (message.includes('interview')) reply = 'Tip: structure answers with context, the action you took, and a measurable result.';
  else if (message.includes('skill') || message.includes('gap')) reply = 'Use the skill-gap endpoint to see missing skills and a learning roadmap for any job.';
  else if (message.includes('resume')) reply = 'Update your skills via PUT /api/candidates/me — the AI matching engine uses that list.';
  else reply = 'I can help with application status, interview tips, resume scoring, or skill gaps.';
  res.json({ reply });
});

module.exports = router;
