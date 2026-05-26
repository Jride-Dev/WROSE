<<<<<<< HEAD
# WROSE — Working Reddit Operational Signal Engine

WROSE is a local-first operational signal engine for Reddit subreddit analysis. It ingests public Reddit posts and comments, computes aggregate operational signals, and provides a replayable timeline of community activity patterns.

## Phase Status

- **Phase 1A — Core Engine (Complete)**: FastAPI backend, SQLite database, Reddit ingestion scaffold, six operational signals, React/Vite dashboard
- **Phase 1B — Devvit Readiness Layer (Complete)**: API contracts for future WROSE Sentinel Devvit app, safety boundaries, backend readiness routes

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

## Future: WROSE Sentinel

WROSE Sentinel will be a Reddit-native moderator intelligence assistant (Devvit app) that helps moderators understand chaotic conversations through replay, signal analysis, and anomaly surfacing. All actions are analytical only — no automated moderation.

## Project Structure

```
F:\WROSE
  apps/
    api/          # FastAPI backend
    frontend/     # React/Vite dashboard
    devvit/       # Future WROSE Sentinel Devvit app (reserved)
  sql/
    wrose.db      # SQLite database (created at runtime)
    migrations/
  docs/
    PHASE_1.md
    PHASE_1_SPLIT.md
    SIGNAL_DEFINITIONS.md
    DEVVIT_INTEGRATION_PLAN.md
    ETHICS_AND_BOUNDARIES.md
  .env.example
  .gitignore
  README.md
```
=======
# WROSE
Working Reddit Operational Signal Engine
>>>>>>> f3c53ef846b3dacbcf082ea6fa18e89552263ce8
