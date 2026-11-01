# CVEEEZ AI — Personal Career Coach · Prototype report (1 Nov 2026)

## 1. System audit (what exists)
The CVEEEZ job finder (cveeez.netlify.app) has: in-browser CV reading (PDF/DOCX), a rule-based CV parser (titles, years, skills from a 173-skill EN/AR dictionary, education, certifications, achievements), an explainable job-match score, and a real job index (employer job boards, refreshed every 2 hours) behind `/api/search` and `/jobs.json`.
It has **no** user accounts, login, user database, stored CVs, application history, employer area, Academy or Snappers data, and **no** AI model. The CVEEEZ AI prototype reuses all of the existing engine and adds none of the missing infrastructure.

## 2. Zero-cost feasibility

| Feature | Zero cost? | Reused | Technology | Limitation |
|---|---|---|---|---|
| Career coach (text) | Yes | CV parser, job index, title similarity | Guided engine; optional on-device LLM | Guided mode follows patterns; free-form chat needs the on-device model |
| Voice (speak + listen) | Yes | — | Browser Web Speech API | Best in Chrome/Edge/Android; Safari limited; recognition is done by the browser vendor's service |
| Shared text/voice context | Yes | — | One conversation + shared context (target role) | Stored in this browser only |
| CV review | Yes | CV parser + job index | Rules (sections, length, measurable results, weak wording, ATS) + tailoring to a real job | Rule-based; does not judge content quality |
| Mock interview (6 modes) | Yes | Profile skills, real job requirements | Question banks, follow-ups, structural scoring, speaking pace | Scores structure (length, own role, result, pace), not correctness |
| Job search assistant | Yes | Real CVEEEZ jobs + match score | `core.scoreJob` | Uses the bundled index snapshot (27 Oct) until hosted next to the live site |
| Skills coach | Yes | Requirements of real adverts | Frequency of missing skills across 40 similar adverts | CVEEEZ Academy is not connected (no data available) |
| Difficult conversations (6 scenarios) | Yes | — | Scripted counterpart reacting to tactics + feedback | Scripted, not open-ended |
| Free-form AI conversation | Yes, on capable devices | Everything above as context | Qwen2.5 1.5B / 3B (open source) in the browser via WebLLM + WebGPU | 1–2 GB first download; needs a recent computer with WebGPU; slow or unavailable on most phones; Arabic quality acceptable, below paid models. **Not tested end-to-end here** (the build environment cannot download the model). |
| Chrome built-in AI | Yes, if present | Same | Prompt API (Gemini Nano) | English only; desktop with 16 GB RAM, >4 GB GPU |
| Login / user accounts / saved history across devices | **No** | — | — | Requires a backend + database (cveeez.com's, or a future service) |

Paid services were not used. Nothing requires payment details.

## 3. What was tested (automated, real browser, EN + AR)
| Scenario | Result |
|---|---|
| 1. Fresh graduate, first job | Pass — first-job plan, asks for target field |
| 2. Sales → business development | Pass — analysed 40 real adverts; skills user has vs. missing (B2B Sales 29/40, Lead Generation 29/40, CRM 28/40…) + plan; Arabic «تطوير الأعمال» recognised |
| 3. CV review | Pass — strengths, issues, weak bullets rewritten with [placeholders], ATS tips, tailoring to a real job |
| 4. HR interview | Pass — weak answer 1.5/5 with reasons; strong answer 4.5/5; next question; final assessment |
| 5. Text → voice switch | Pass — voice follow-up “What skills am I missing for this position?” answered for the role set earlier by text |
| 6. Jobs matching the profile | Pass — real jobs in Saudi Arabia with estimated match and original links |
| 7. Salary negotiation | Pass — counterpart reacts to a justified number; feedback at the end |
| Reload | Pass — conversation and context kept in the browser |
Voice was tested as the recognised text entering the same conversation; the microphone itself and the on-device AI model must be tried on a real device.

## 4. Success criteria
| # | Criterion | Status |
|---|---|---|
| 1 | Log into existing account | Not possible — no accounts exist in the job finder |
| 2 | Access personal coach | Working |
| 3 | Discuss objectives by text | Working (guided; free-form with on-device AI) |
| 4 | Continue by voice | Working (browser speech) |
| 5 | CV feedback | Working |
| 6 | Realistic interview | Working (guided; open-ended with on-device AI) |
| 7 | Feedback on answers | Working |
| 8 | Search jobs in CVEEEZ database | Working |
| 9 | Skill gaps | Working (from real adverts) |
| 10 | Difficult conversations | Working (6 scripted scenarios) |

## 5. Needs investment later
- A hosted AI model (any paid API) for good Arabic on every phone.
- Accounts + database (or integration with cveeez.com) for login, history across devices, application history.
- Higher-quality voices (paid TTS) if browser voices are not good enough.
- CVEEEZ Academy catalogue data to recommend courses.

## 6. Running it
Static files only. Serve the folder over HTTPS (any static host) or locally: `python3 -m http.server` in this folder, then open http://localhost:8000. Microphone and WebGPU need https or localhost.
To use live jobs instead of the snapshot, host the folder under cveeez.netlify.app (e.g. `/coach/`) so `jobs.json` and `/api/search` are same-origin — this needs one Netlify deploy (15 credits); wait until 27 Nov.
