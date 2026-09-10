/* ================= STATE ================= */
let currentRole = 'admin';
let currentUser = {name:'', email:''};

let jobs = [
  {id:1, title:'Frontend Developer', dept:'Engineering', level:'Mid', skills:['React','JavaScript','CSS','HTML','Git']},
  {id:2, title:'Backend Developer', dept:'Engineering', level:'Mid', skills:['Node.js','Express','MongoDB','JWT','REST APIs']},
  {id:3, title:'Data Analyst', dept:'Analytics', level:'Entry', skills:['SQL','Excel','Python','Data Visualization']}
];
let nextJobId = 4;

let candidates = [
  {name:'Rohit Verma', skills:['React','JavaScript','HTML','CSS'], status:'Screening'},
  {name:'Priya Nair', skills:['Node.js','MongoDB','Express','Git'], status:'Interview scheduled'},
  {name:'Aman Gupta', skills:['Python','SQL','Excel'], status:'Applied'}
];

let applications = []; // {candidate, jobId, appliedOn, score}
let interviewResults = []; // {candidate, jobTitle, score, feedback}
let myProfile = {name:'', location:'', experience:'', goal:''};
let mySkills = [];
let myApplications = [];
let currentMockJob = null;
let chatHistory = [];

const questionBank = [
  "Tell me about a challenging project you worked on and how you handled it.",
  "How would you approach debugging a performance issue in a web application?",
  "Describe a time you had to learn a new technology quickly.",
  "How do you prioritize tasks when working on multiple features at once?",
  "Explain a technical concept from your resume to someone non-technical."
];

/* ================= LOGIN ================= */
function setRole(role){
  currentRole = role;
  document.getElementById('roleAdminBtn').classList.toggle('active', role==='admin');
  document.getElementById('roleCandBtn').classList.toggle('active', role==='candidate');
}

function doLogin(){
  let name = document.getElementById('loginName').value.trim() || (currentRole==='admin' ? 'Admin User' : 'Candidate User');
  currentUser.name = name;
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').classList.add('show');
  document.getElementById('whoName').textContent = name;
  document.getElementById('whoRole').textContent = currentRole==='admin' ? 'Administrator' : 'Candidate';
  if(currentRole==='candidate'){ myProfile.name = name; document.getElementById('profName').value = name; }
  buildNav();
  seedDataOnce();
  navigate(currentRole==='admin' ? 'admin-dashboard' : 'cand-dashboard');
}

function logout(){
  document.getElementById('app').classList.remove('show');
  document.getElementById('loginScreen').style.display = 'flex';
}

/* ================= NAV ================= */
const adminNav = [
  ['admin-dashboard','Dashboard'],['admin-jobs','Jobs'],['admin-candidates','Candidates'],
  ['admin-matching','AI Matching'],['admin-interviews','Interview Results'],
  ['admin-analytics','Analytics'],['admin-settings','Settings']
];
const candNav = [
  ['cand-dashboard','Dashboard'],['cand-profile','Profile'],['cand-resume','Resume Upload'],
  ['cand-jobs','Browse Jobs'],['cand-applications','Applications'],['cand-skillgap','AI Skill Gap'],
  ['cand-mock','Mock Interview'],['cand-chatbot','HR Chatbot'],['cand-settings','Settings']
];

function buildNav(){
  let list = currentRole==='admin' ? adminNav : candNav;
  let el = document.getElementById('navItems');
  el.innerHTML = '';
  list.forEach(([id,label])=>{
    let b = document.createElement('button');
    b.className='nav-item'; b.id='nav-'+id;
    b.innerHTML = '<span class="dot"></span>'+label;
    b.onclick = ()=>navigate(id);
    el.appendChild(b);
  });
}

function navigate(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  let btn = document.getElementById('nav-'+id); if(btn) btn.classList.add('active');
  let list = currentRole==='admin' ? adminNav : candNav;
  let found = list.find(x=>x[0]===id);
  document.getElementById('pageTitle').textContent = found ? found[1] : 'Dashboard';
  document.getElementById('pageCrumb').textContent = (currentRole==='admin'?'Admin Portal':'Candidate Portal') + ' / ' + (found?found[1]:'');
  renderAll();
}

/* ================= THEME ================= */
function toggleTheme(){
  let html = document.documentElement;
  let dark = html.getAttribute('data-theme')==='dark';
  html.setAttribute('data-theme', dark? '' : 'dark');
  document.getElementById('themeBtn').textContent = dark ? '🌙 Dark mode' : '☀️ Light mode';
}

/* ================= AI HELPERS (rule-based simulation) ================= */
function norm(arr){ return arr.map(s=>s.trim().toLowerCase()).filter(Boolean); }

function matchScore(candSkills, jobSkills){
  let cs = norm(candSkills), js = norm(jobSkills);
  if(js.length===0) return 0;
  let overlap = js.filter(s=>cs.includes(s)).length;
  return Math.round((overlap/js.length)*100);
}

function missingSkills(candSkills, jobSkills){
  let cs = norm(candSkills);
  return jobSkills.filter(s=>!cs.includes(s.toLowerCase()));
}

function haveSkills(candSkills, jobSkills){
  let cs = norm(candSkills);
  return jobSkills.filter(s=>cs.includes(s.toLowerCase()));
}

function recommendation(score){
  if(score>=70) return {text:'Strong fit — recommend interview', cls:'high'};
  if(score>=40) return {text:'Partial fit — consider screening', cls:'mid'};
  return {text:'Low fit — skill gap significant', cls:'low'};
}

function pillFor(score){
  let r = recommendation(score);
  return `<span class="pill ${r.cls}">${score}%</span>`;
}

function roadmapFor(skill){
  const map = {
    'react':'Build a small React project (e.g. a to-do app) and learn hooks & state management.',
    'node.js':'Learn Express fundamentals and build a simple REST API with CRUD routes.',
    'mongodb':'Practice schema design and CRUD operations using MongoDB Atlas free tier.',
    'sql':'Work through SQL joins, aggregations, and query optimization exercises.',
    'python':'Complete a data-handling mini project using pandas.',
    'jwt':'Implement token-based auth in a sample app to understand JWT flow.',
    'git':'Practice branching, merging, and resolving conflicts in a personal repo.',
  };
  let key = skill.toLowerCase();
  return map[key] || `Study the fundamentals of ${skill} and build one small hands-on project.`;
}

/* ================= SEED ================= */
let seeded = false;
function seedDataOnce(){
  if(seeded) return; seeded = true;
  applications = [
    {candidate:'Rohit Verma', jobId:1, appliedOn:'2026-08-20', score: matchScore(['React','JavaScript','HTML','CSS'], jobs[0].skills)},
    {candidate:'Priya Nair', jobId:2, appliedOn:'2026-08-22', score: matchScore(['Node.js','MongoDB','Express','Git'], jobs[1].skills)},
    {candidate:'Aman Gupta', jobId:3, appliedOn:'2026-08-25', score: matchScore(['Python','SQL','Excel'], jobs[2].skills)}
  ];
  interviewResults = [
    {candidate:'Priya Nair', jobTitle:'Backend Developer', score:82, feedback:'Clear structure, strong technical depth.'},
    {candidate:'Rohit Verma', jobTitle:'Frontend Developer', score:68, feedback:'Good fundamentals, elaborate more on trade-offs.'}
  ];
  chatHistory.push({from:'bot', text:"Hi! I'm the HR assistant. Ask me about your application status or interview tips."});
}

/* ================= ADMIN: JOBS ================= */
function postJob(){
  let title = document.getElementById('jobTitle').value.trim();
  let dept = document.getElementById('jobDept').value.trim() || 'General';
  let level = document.getElementById('jobLevel').value;
  let skills = document.getElementById('jobSkills').value.split(',').map(s=>s.trim()).filter(Boolean);
  if(!title || skills.length===0){ alert('Enter a job title and at least one required skill.'); return; }
  jobs.push({id: nextJobId++, title, dept, level, skills});
  document.getElementById('jobTitle').value=''; document.getElementById('jobDept').value=''; document.getElementById('jobSkills').value='';
  renderAll();
}

function renderJobsTable(){
  let body = document.getElementById('jobsTableBody');
  if(!body) return;
  body.innerHTML = jobs.map(j=>{
    let count = applications.filter(a=>a.jobId===j.id).length;
    return `<tr><td>${j.title}</td><td>${j.dept}</td><td><span class="pill neutral">${j.level}</span></td><td>${count}</td></tr>`;
  }).join('');
  document.getElementById('jobCountLabel').textContent = jobs.length + ' active';
}

/* ================= ADMIN: DASHBOARD ================= */
function renderAdminDashboard(){
  document.getElementById('statJobs').textContent = jobs.length;
  document.getElementById('statCands').textContent = candidates.length;
  document.getElementById('statApps').textContent = applications.length;
  let avg = applications.length ? Math.round(applications.reduce((a,b)=>a+b.score,0)/applications.length) : 0;
  document.getElementById('statAvgScore').textContent = avg + '%';

  let chart = document.getElementById('appsByJobChart');
  if(chart){
    let maxCount = Math.max(1, ...jobs.map(j=>applications.filter(a=>a.jobId===j.id).length));
    chart.innerHTML = jobs.map(j=>{
      let count = applications.filter(a=>a.jobId===j.id).length;
      let pct = Math.round((count/maxCount)*100);
      return `<div class="bar-row"><div class="label">${j.title}</div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><div class="bar-val">${count}</div></div>`;
    }).join('') || '<div class="empty">No applications yet</div>';
  }

  let top = [...applications].sort((a,b)=>b.score-a.score).slice(0,5);
  let tb = document.getElementById('topCandidatesTable');
  if(tb){
    tb.innerHTML = top.map(a=>{
      let job = jobs.find(j=>j.id===a.jobId);
      return `<tr><td><span class="avatar">${a.candidate[0]}</span>${a.candidate}</td><td>${job?job.title:'-'}</td><td>${pillFor(a.score)}</td></tr>`;
    }).join('') || '<tr><td class="empty">No data yet</td></tr>';
  }
}

/* ================= ADMIN: CANDIDATES ================= */
function renderCandidatesTable(){
  let body = document.getElementById('candidatesTableBody');
  if(!body) return;
  body.innerHTML = candidates.map(c=>{
    let appliedJobs = applications.filter(a=>a.candidate===c.name).map(a=>{let j=jobs.find(j=>j.id===a.jobId); return j?j.title:null;}).filter(Boolean);
    return `<tr><td><span class="avatar">${c.name[0]}</span>${c.name}</td><td>${c.skills.map(s=>`<span class="tag">${s}</span>`).join('')}</td><td>${appliedJobs.join(', ')||'—'}</td><td><span class="pill info">${c.status}</span></td></tr>`;
  }).join('');
}

/* ================= ADMIN: MATCHING ================= */
function fillJobSelect(selectId){
  let sel = document.getElementById(selectId);
  if(!sel) return;
  let current = sel.value;
  sel.innerHTML = jobs.map(j=>`<option value="${j.id}">${j.title}</option>`).join('');
  if(current) sel.value = current;
}

function renderMatching(){
  fillJobSelect('matchJobSelect');
  let sel = document.getElementById('matchJobSelect');
  let jobId = parseInt(sel.value || (jobs[0] ? jobs[0].id : 0));
  let job = jobs.find(j=>j.id===jobId);
  let body = document.getElementById('matchingTableBody');
  if(!job || !body) return;
  let ranked = candidates.map(c=>{
    let score = matchScore(c.skills, job.skills);
    let overlap = haveSkills(c.skills, job.skills);
    return {c, score, overlap};
  }).sort((a,b)=>b.score-a.score);
  body.innerHTML = ranked.map((r,i)=>{
    let rec = recommendation(r.score);
    return `<tr><td>#${i+1}</td><td><span class="avatar">${r.c.name[0]}</span>${r.c.name}</td><td>${pillFor(r.score)}</td><td>${r.overlap.map(s=>`<span class="tag have">${s}</span>`).join('')||'—'}</td><td><span class="pill ${rec.cls}">${rec.text}</span></td></tr>`;
  }).join('') || '<tr><td class="empty">No candidates yet</td></tr>';
}

/* ================= ADMIN: INTERVIEWS ================= */
function renderInterviewResults(){
  let body = document.getElementById('interviewResultsBody');
  if(!body) return;
  body.innerHTML = interviewResults.map(r=>`<tr><td><span class="avatar">${r.candidate[0]}</span>${r.candidate}</td><td>${r.jobTitle}</td><td>${pillFor(r.score)}</td><td>${r.feedback}</td></tr>`).join('') || '<tr><td class="empty">No interviews yet</td></tr>';
}

/* ================= ADMIN: ANALYTICS ================= */
function renderAnalytics(){
  let dist = document.getElementById('scoreDistChart');
  if(dist){
    let buckets = {'0-39%':0,'40-69%':0,'70-100%':0};
    applications.forEach(a=>{
      if(a.score<40) buckets['0-39%']++; else if(a.score<70) buckets['40-69%']++; else buckets['70-100%']++;
    });
    let max = Math.max(1, ...Object.values(buckets));
    dist.innerHTML = Object.entries(buckets).map(([k,v])=>{
      let pct = Math.round((v/max)*100);
      return `<div class="bar-row"><div class="label">${k}</div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><div class="bar-val">${v}</div></div>`;
    }).join('');
  }
  let funnel = document.getElementById('funnelChart');
  if(funnel){
    let stages = [
      ['Applied', applications.length],
      ['Screened', Math.round(applications.length*0.7)],
      ['Interviewed', interviewResults.length],
      ['Selected', interviewResults.filter(r=>r.score>=75).length]
    ];
    let max = Math.max(1, ...stages.map(s=>s[1]));
    funnel.innerHTML = stages.map(([k,v])=>{
      let pct = Math.round((v/max)*100);
      return `<div class="bar-row"><div class="label">${k}</div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><div class="bar-val">${v}</div></div>`;
    }).join('');
  }
}

/* ================= CANDIDATE: PROFILE ================= */
function saveProfile(){
  myProfile.name = document.getElementById('profName').value.trim();
  myProfile.location = document.getElementById('profLoc').value.trim();
  myProfile.experience = document.getElementById('profExp').value.trim();
  myProfile.goal = document.getElementById('profGoal').value.trim();
  alert('Profile saved.');
}

/* ================= CANDIDATE: RESUME ================= */
function submitResume(){
  let skills = document.getElementById('candSkills').value.split(',').map(s=>s.trim()).filter(Boolean);
  if(skills.length===0){ alert('Enter at least one skill.'); return; }
  mySkills = skills;
  let box = document.getElementById('resumeScoreBox');
  let completeness = Math.min(100, skills.length*15);
  let bestJob = jobs.map(j=>({j, score: matchScore(skills, j.skills)})).sort((a,b)=>b.score-a.score)[0];
  box.classList.remove('empty');
  box.innerHTML = `
    <div class="bar-row"><div class="label">Profile completeness</div><div class="bar-track"><div class="bar-fill" style="width:${completeness}%"></div></div><div class="bar-val">${completeness}%</div></div>
    <div class="muted section-gap" style="margin-top:10px">Parsed skills</div>
    <div>${skills.map(s=>`<span class="tag have">${s}</span>`).join('')}</div>
    <div class="muted section-gap" style="margin-top:14px">Best matching role right now</div>
    <div>${bestJob ? `<b>${bestJob.j.title}</b> — ${pillFor(bestJob.score)}` : 'No jobs posted yet'}</div>`;
  renderAll();
}

/* ================= CANDIDATE: DASHBOARD ================= */
function renderCandDashboard(){
  document.getElementById('cStatApps').textContent = myApplications.length;
  let scores = jobs.map(j=>matchScore(mySkills, j.skills));
  let best = scores.length ? Math.max(...scores) : null;
  document.getElementById('cStatBest').textContent = best!==null ? best+'%' : '—';
  let bestJob = jobs.find(j=>matchScore(mySkills,j.skills)===best);
  document.getElementById('cStatGaps').textContent = bestJob ? missingSkills(mySkills,bestJob.skills).length : '—';
  document.getElementById('cStatInterview').textContent = interviewResults.find(r=>r.candidate===currentUser.name) ? 'Completed' : 'Not started';

  let body = document.getElementById('recommendedTableBody');
  if(body){
    let ranked = jobs.map(j=>({j, score:matchScore(mySkills,j.skills), missing:missingSkills(mySkills,j.skills)})).sort((a,b)=>b.score-a.score);
    body.innerHTML = ranked.map(r=>`<tr><td>${r.j.title}</td><td>${pillFor(r.score)}</td><td>${r.missing.slice(0,3).map(s=>`<span class="tag missing">${s}</span>`).join('')||'None'}</td><td><button class="btn sm" onclick="applyToJob(${r.j.id})">Apply</button></td></tr>`).join('') || '<tr><td class="empty">No jobs posted yet</td></tr>';
  }
}

function applyToJob(jobId){
  let job = jobs.find(j=>j.id===jobId);
  if(!job) return;
  if(myApplications.find(a=>a.jobId===jobId)){ alert('Already applied to this job.'); return; }
  let score = matchScore(mySkills, job.skills);
  myApplications.push({jobId, jobTitle:job.title, appliedOn:new Date().toISOString().slice(0,10), score, status:'Applied'});
  applications.push({candidate:currentUser.name, jobId, appliedOn:new Date().toISOString().slice(0,10), score});
  if(!candidates.find(c=>c.name===currentUser.name)){
    candidates.push({name:currentUser.name, skills:mySkills, status:'Applied'});
  }
  alert(`Applied to ${job.title} — AI match score: ${score}%`);
  renderAll();
}

/* ================= CANDIDATE: JOBS / APPLICATIONS ================= */
function renderBrowseJobs(){
  let body = document.getElementById('browseJobsBody');
  if(!body) return;
  body.innerHTML = jobs.map(j=>`<tr><td>${j.title}</td><td>${j.dept}</td><td>${j.skills.map(s=>`<span class="tag">${s}</span>`).join('')}</td><td><button class="btn sm" onclick="applyToJob(${j.id})">Apply</button></td></tr>`).join('');
}

function renderMyApplications(){
  let body = document.getElementById('myApplicationsBody');
  if(!body) return;
  body.innerHTML = myApplications.map(a=>`<tr><td>${a.jobTitle}</td><td>${a.appliedOn}</td><td>${pillFor(a.score)}</td><td><span class="pill info">${a.status}</span></td></tr>`).join('') || '<tr><td class="empty">You haven\'t applied to any jobs yet</td></tr>';
}

/* ================= CANDIDATE: SKILL GAP ================= */
function renderSkillGap(){
  fillJobSelect('gapJobSelect');
  let sel = document.getElementById('gapJobSelect');
  let jobId = parseInt(sel.value || (jobs[0] ? jobs[0].id : 0));
  let job = jobs.find(j=>j.id===jobId);
  if(!job) return;
  currentMockJob = job;
  let have = haveSkills(mySkills, job.skills);
  let missing = missingSkills(mySkills, job.skills);
  document.getElementById('skillsHave').innerHTML = have.map(s=>`<span class="tag have">${s}</span>`).join('') || '<span class="muted">None yet — upload your resume first</span>';
  document.getElementById('skillsMissing').innerHTML = missing.map(s=>`<span class="tag missing">${s}</span>`).join('') || '<span class="muted">No gaps — great fit!</span>';
  document.getElementById('roadmapList').innerHTML = missing.length ? missing.map(s=>`<div class="bar-row" style="align-items:flex-start"><div class="label" style="width:110px;font-weight:600;color:var(--ink)">${s}</div><div style="flex:1;font-size:13px;color:var(--ink-soft)">${roadmapFor(s)}</div></div>`).join('') : '<div class="empty">No roadmap needed — you meet the requirements.</div>';
  document.getElementById('mockJobLabel').textContent = 'Practicing for: ' + job.title;
}

/* ================= CANDIDATE: MOCK INTERVIEW ================= */
function loadMockQuestion(){
  let q = questionBank[Math.floor(Math.random()*questionBank.length)];
  document.getElementById('mockQuestionBox').textContent = q;
  document.getElementById('mockFeedbackCard').style.display = 'none';
  document.getElementById('mockAnswer').value = '';
}

function evaluateMockAnswer(){
  let answer = document.getElementById('mockAnswer').value.trim();
  if(!answer){ alert('Type an answer first.'); return; }
  let words = answer.split(/\s+/).filter(Boolean).length;
  let score = Math.min(95, 40 + words*2 + (/because|for example|result|impact/i.test(answer) ? 10 : 0));
  let feedback = [];
  if(words < 20) feedback.push('Your answer is quite short — add more concrete detail or an example.');
  else feedback.push('Good length and structure.');
  if(!/because|for example|result|impact/i.test(answer)) feedback.push('Try backing your answer with a specific example or measurable outcome.');
  else feedback.push('Nice use of a concrete example to support your point.');

  document.getElementById('mockFeedbackCard').style.display = 'block';
  document.getElementById('mockFeedbackBox').innerHTML = `
    <div class="bar-row"><div class="label">AI score</div><div class="bar-track"><div class="bar-fill" style="width:${score}%"></div></div><div class="bar-val">${score}</div></div>
    <ul style="margin:10px 0 0;padding-left:18px;font-size:13.5px;color:var(--ink-soft)">${feedback.map(f=>`<li>${f}</li>`).join('')}</ul>`;

  interviewResults.push({candidate:currentUser.name, jobTitle: currentMockJob?currentMockJob.title:'General', score, feedback: feedback[0]});
}

/* ================= CANDIDATE: CHATBOT ================= */
function renderChat(){
  let box = document.getElementById('chatBox');
  if(!box) return;
  box.innerHTML = chatHistory.map(m=>`<div class="chat-msg ${m.from}">${m.text}</div>`).join('');
  box.scrollTop = box.scrollHeight;
}
function botReply(text){
  let t = text.toLowerCase();
  if(t.includes('status')) return `You currently have ${myApplications.length} application(s). Check the "Applications" tab for match scores and stage.`;
  if(t.includes('interview')) return 'Tip: structure answers with a short context, the action you took, and the measurable result.';
  if(t.includes('skill') || t.includes('gap')) return 'Head to "AI Skill Gap" to see exactly which skills a job needs that you don\'t have yet, plus a learning roadmap.';
  if(t.includes('resume')) return 'Upload your skills in "Resume Upload" — the AI will score your profile and suggest your best-fit role.';
  if(t.includes('hi') || t.includes('hello')) return 'Hello! Ask me about your application status, interview tips, or skill gaps.';
  return "I can help with application status, interview tips, resume scoring, or skill gaps — try asking about one of those.";
}
function sendChat(){
  let input = document.getElementById('chatInput');
  let val = input.value.trim();
  if(!val) return;
  chatHistory.push({from:'user', text:val});
  chatHistory.push({from:'bot', text:botReply(val)});
  input.value='';
  renderChat();
}

/* ================= MASTER RENDER ================= */
function renderAll(){
  renderJobsTable();
  renderAdminDashboard();
  renderCandidatesTable();
  renderMatching();
  renderInterviewResults();
  renderAnalytics();
  renderCandDashboard();
  renderBrowseJobs();
  renderMyApplications();
  renderSkillGap();
  renderChat();
  let mqb = document.getElementById('mockQuestionBox');
  if(mqb && mqb.textContent==='Loading question…'){
    loadMockQuestion();
  }
}