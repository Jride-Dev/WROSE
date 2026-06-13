# WROSE — Working Reddit Operational Signal Engine

WROSE is a local-first operational signal engine for Reddit subreddit analysis. It ingests public Reddit posts and comments, computes aggregate operational signals, and provides a replayable timeline of community activity patterns.

## Phase Status

- **Phase 1A — Core Engine (Complete)**: FastAPI backend, SQLite database, Reddit ingestion scaffold, six operational signals, React/Vite dashboard
- **Phase 1B — Devvit Readiness Layer (Complete)**: API contracts for WROSE Sentinel Devvit app, safety boundaries, backend readiness routes
- **Phase 2I — Native Devvit Sentinel Adapter (Complete)**: WROSE Sentinel now runs native Devvit analysis using Reddit post context — no HTTP fetch required. External backend remains the WROSE signal lab (optional). Reddit rejected personal HTTP fetch domains.

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

- **Native Devvit Analysis (Default)**: Works inside Reddit using post context — no HTTP fetch, tunnel, or external backend needed. Analyzes thread context, computes v0.1 volatility score, suggests moderator view.
- **External Backend (Optional)**: FastAPI signal lab (`apps/api`) preserved. Integration code behind optional flag. Requires Reddit-approved HTTP fetch domain (both `wrose-api.jri-techyes.top` and ngrok domain were rejected).
- **Safety invariant**: `automated_action_taken: false` enforced in every path.
- **Phase 2I complete**: See `docs/PHASE_2I_NATIVE_DEVVIT_ADAPTER.md`.

### Devvit Playtest Rules

- Playtest only in `r/wrose_sentinel_dev`
- Do not run `npx devvit publish` or `npx devvit publish --public`
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
  PHASE_2I_NATIVE_DEVVIT_ADAPTER.md
  ...
.env.example
.gitignore
README.md
```

## Safety Boundary

WROSE Sentinel does **not** remove, lock, ban, mute, report, approve, distinguish, or modify Reddit content. Every analysis response preserves `automated_action_taken: false`.
