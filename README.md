# AI HR Recruitment Simulator

A full-stack demo project matching the internship spec: a React-style frontend (built here as HTML/CSS/JS for zero-setup viewing) and a Node.js/Express/MongoDB backend with JWT auth and a rule-based AI engine standing in for OpenAI/Gemini calls.

## Folder structure

```
project/
├── frontend/
│   ├── index.html      → App shell, login screen, admin & candidate portal markup
│   ├── style.css        → Full theme (light/dark), layout, components
│   └── script.js        → App state, navigation, and simulated AI logic (client-side demo mode)
├── backend/
│   ├── server.js         → Express app entry point
│   ├── package.json
│   ├── .env.example       → Copy to .env and fill in your own values
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── middleware/
│   │   └── auth.js         → JWT verification + role-based access
│   ├── routes/
│   │   ├── auth.js          → register / login / forgot-password
│   │   ├── jobs.js           → job CRUD (admin)
│   │   ├── candidates.js      → candidate profile & skills
│   │   ├── applications.js    → apply to jobs, view/update applications
│   │   └── ai.js               → matching, skill-gap, mock interview, chatbot
│   └── utils/
│       └── aiEngine.js          → rule-based scoring/matching (swap for real AI API here)
└── README.md
```

## Running the frontend (no setup needed)

Just open `frontend/index.html` in a browser. It runs entirely client-side with in-memory mock data, so you can demo the whole flow (login → post jobs → upload resume → AI matching → skill gap → mock interview → chatbot) with no backend running.

## Running the backend

```
cd backend
npm install
cp .env.example .env      # edit MONGO_URI and JWT_SECRET
npm start                  # or: npm run dev (with nodemon)
```

Requires a MongoDB instance (local or Atlas). If MongoDB isn't reachable, the server still starts so you can inspect the code/routes, but data won't persist.

### Key API routes

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Create an account (admin or candidate) |
| POST | /api/auth/login | Log in, returns a JWT |
| GET/POST | /api/jobs | List jobs / post a job (admin) |
| GET/PUT | /api/candidates/me | View/update your profile & skills |
| POST | /api/applications | Apply to a job (candidate) |
| GET | /api/applications | View all applications, ranked (admin) |
| GET | /api/ai/match/:jobId | AI-ranked candidates for a job (admin) |
| GET | /api/ai/skill-gap/:jobId | Skill gap + learning roadmap (candidate) |
| GET | /api/ai/mock-interview/question | Get a mock interview question |
| POST | /api/ai/mock-interview/evaluate | Get AI feedback on an answer |
| POST | /api/ai/chatbot | Simple HR chatbot reply |

## Notes on the "AI" features

Real resume parsing / semantic matching / interview scoring would normally call the OpenAI or Gemini API. To keep this project runnable with zero API keys (useful for a demo or internship submission), `utils/aiEngine.js` implements the same behavior with transparent rule-based logic (skill-overlap %, keyword checks). Swapping in a real LLM call later only means editing that one file — the rest of the app already treats it as the "AI layer".

## Not implemented in this demo

Voice/video interviews, real-time coding tests, file storage (Cloudinary/S3), OCR, and email/SMS notifications are in the original spec but out of scope here — they need paid third-party services. The rest of the modules (auth, jobs, candidates, applications, matching, skill gap, mock interview, chatbot, analytics) are implemented.
