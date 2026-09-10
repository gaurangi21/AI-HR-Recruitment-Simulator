// Rule-based "AI" engine.
// In production this logic would be replaced by calls to the OpenAI/Gemini API
// (resume parsing, semantic skill matching, interview question generation, etc).
// Keeping it rule-based here means the whole project runs with zero API keys.

function normalize(list) {
  return (list || []).map(s => s.trim().toLowerCase()).filter(Boolean);
}

function computeMatchScore(candidateSkills, jobSkills) {
  const cs = normalize(candidateSkills);
  const js = normalize(jobSkills);
  if (js.length === 0) return 0;
  const overlap = js.filter(s => cs.includes(s)).length;
  return Math.round((overlap / js.length) * 100);
}

function missingSkills(candidateSkills, jobSkills) {
  const cs = normalize(candidateSkills);
  return (jobSkills || []).filter(s => !cs.includes(s.toLowerCase()));
}

function matchingSkills(candidateSkills, jobSkills) {
  const cs = normalize(candidateSkills);
  return (jobSkills || []).filter(s => cs.includes(s.toLowerCase()));
}

function recommendationFor(score) {
  if (score >= 70) return 'Strong fit — recommend interview';
  if (score >= 40) return 'Partial fit — consider screening';
  return 'Low fit — skill gap significant';
}

const ROADMAP = {
  react: 'Build a small React project (e.g. a to-do app) and learn hooks & state management.',
  'node.js': 'Learn Express fundamentals and build a simple REST API with CRUD routes.',
  mongodb: 'Practice schema design and CRUD operations using MongoDB Atlas free tier.',
  sql: 'Work through SQL joins, aggregations, and query optimization exercises.',
  python: 'Complete a data-handling mini project using pandas.',
  jwt: 'Implement token-based auth in a sample app to understand JWT flow.',
  git: 'Practice branching, merging, and resolving conflicts in a personal repo.'
};

function roadmapFor(skill) {
  return ROADMAP[skill.toLowerCase()] || `Study the fundamentals of ${skill} and build one small hands-on project.`;
}

const QUESTION_BANK = [
  'Tell me about a challenging project you worked on and how you handled it.',
  'How would you approach debugging a performance issue in a web application?',
  'Describe a time you had to learn a new technology quickly.',
  'How do you prioritize tasks when working on multiple features at once?',
  'Explain a technical concept from your resume to someone non-technical.'
];

function randomQuestion() {
  return QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
}

function evaluateAnswer(answer) {
  const words = (answer || '').trim().split(/\s+/).filter(Boolean).length;
  const hasEvidence = /because|for example|result|impact/i.test(answer || '');
  const score = Math.min(95, 40 + words * 2 + (hasEvidence ? 10 : 0));
  const feedback = [];
  feedback.push(words < 20
    ? 'Answer is quite short — add more concrete detail or an example.'
    : 'Good length and structure.');
  feedback.push(hasEvidence
    ? 'Nice use of a concrete example to support the point.'
    : 'Try backing the answer with a specific example or measurable outcome.');
  return { score, feedback };
}

module.exports = {
  computeMatchScore,
  missingSkills,
  matchingSkills,
  recommendationFor,
  roadmapFor,
  randomQuestion,
  evaluateAnswer
};
