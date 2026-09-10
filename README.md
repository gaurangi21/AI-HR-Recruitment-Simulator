A full-stack simulation of an AI-assisted hiring platform — separate Admin and Candidate portals with job matching, skill-gap analysis, and mock interviews.

The "AI" is rule-based (skill overlap %, keyword checks) rather than a real LLM call, so it runs with zero API keys — all of that logic lives in one file (utils/aiEngine.js), making it easy to swap in a real OpenAI/Gemini call later.

As an admin: post jobs, see candidates ranked by match score, review mock-interview results, view basic analytics.

As a candidate: enter your skills, get instant match scores against open jobs, see what skills you're missing for a role, get a learning tip per gap, and try a mock interview with automated feedback.
