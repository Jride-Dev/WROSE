# WROSE — Working Reddit Operational Signal Engine

WROSE is a local-first operational signal engine for Reddit subreddit analysis. It ingests public Reddit posts and comments, computes aggregate operational signals, and provides a replayable timeline of community activity patterns.

## Phase Status

- **Phase 1A — Core Engine (Complete)**: FastAPI backend, SQLite database, Reddit ingestion scaffold, six operational signals, React/Vite dashboard
- **Phase 1B — Devvit Readiness Layer (Complete)**: API contracts for WROSE Sentinel Devvit app, safety boundaries, backend readiness routes
- **Phase 2 — WROSE Sentinel Devvit App (In Progress)**: Reddit-native moderator intelligence assistant — Demo Mode playtest passed, backend-connected mode blocked pending HTTP fetch domain approval

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd apps/api
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=WROSE/0.1 by YOUR_REDDIT_USERNAME
DATABASE_URL=sqlite:///../../sql/wrose.db
API_HOST=127.0.0.1
API_PORT=8000
```

The backend works with mock data even without Reddit credentials.

## How to Run

1. Start the backend: `cd apps/api && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
2. Start the frontend: `cd apps/frontend && npm run dev`
3. Open http://localhost:5173
4. Enter a subreddit name and click "Ingest"

## WROSE Sentinel

WROSE Sentinel is a Reddit-native moderator intelligence assistant (Devvit app) in `apps/devvit/wrose-sentinel/`. It helps moderators understand chaotic conversations through replay, signal analysis, and anomaly surfacing. All actions are analytical only — no automated moderation.

### Current Status

- **Demo Mode**: Works in Reddit — returns safe placeholder responses when backend is unreachable. Playtest passed (2026-05-28).
- **Backend-connected mode**: Blocked pending Reddit approval of the HTTP fetch domain (`wrose-api.jri-techyes.top`).
- **Config**: `devvit.json` replaces legacy `devvit.yaml`. HTTP fetch domain allowlist targets `wrose-api.jri-techyes.top`.
- **UX**: Modal readability improved (commit `8358bdd`).
- **Safety invariant**: `automated_action_taken: false` is enforced in every response path. No destructive Reddit moderation actions are implemented.

### Devvit Playtest Rules

- Playtest only in `r/wrose_sentinel_dev`
- Do not run `npx devvit publish`
- Do not run `npx devvit publish --public`
- Do not run `npm audit fix --force`

## Project Structure

```
apps/
  api/                       # FastAPI backend
  frontend/                  # React/Vite dashboard
  devvit/wrose-sentinel/     # WROSE Sentinel Devvit app
sql/
  wrose.db                   # SQLite database (created at runtime)
  migrations/
docs/
  PHASE_1.md
  PHASE_1_SPLIT.md
  SIGNAL_DEFINITIONS.md
  DEVVIT_INTEGRATION_PLAN.md
  ETHICS_AND_BOUNDARIES.md
  PHASE_2_DEVVIT_SCAFFOLD.md
  DEVVIT_LAUNCH_READINESS.md
  DEVVIT_SECURITY_NOTES.md
  BACKEND_EXPOSURE_PLAN.md
  TUNNEL_PLAYTEST_SETUP.md
  SANITY_CHECK_2026-05-28.md
  ...
.env.example
.gitignore
README.md
```

## Safety Boundary

WROSE Sentinel does **not** remove, lock, ban, mute, report, approve, distinguish, or modify Reddit content. Every analysis response preserves `automated_action_taken: false`.
