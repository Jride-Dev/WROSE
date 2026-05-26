# WROSE Phase 1

## Phase 1A: Core WROSE Engine (Complete)

### Scope

- FastAPI backend with SQLite persistence
- Reddit ingestion scaffold with mock data fallback
- Six operational signals with transparent calculation
- Replay timeline generation from ingested data
- React/Vite dark-operational dashboard
- Comprehensive documentation

### Deliverables

- Working API with health, ingestion, subreddit, signals, and replay endpoints
- SQLite database with subreddits, posts, comments, signal_snapshots, anomalies, and replay_frames tables
- Signal engine v0.1 with six aggregate metrics
- Frontend dashboard with subreddit selector, signal cards, activity chart, anomaly feed, replay timeline, and posts table
- Documentation: README, PHASE_1, SIGNAL_DEFINITIONS, ETHICS_AND_BOUNDARIES

### Non-Goals

- Authentication / user accounts
- Payment systems
- Supabase or cloud database
- Automated moderation actions
- User-level profiling or diagnosis
- Truth detection or disinformation labeling
- Real-time WebSocket streaming
- Machine learning models
- Production deployment

## Phase 1B: Devvit Readiness Layer (Complete)

### Scope

- API contract definitions for future WROSE Sentinel Devvit app
- Backend readiness routes for Devvit moderator actions
- Safety boundary enforcement (automated_action_taken: false)
- Placeholder Devvit app folder for future development
- Documentation: PHASE_1_SPLIT, DEVVIT_INTEGRATION_PLAN

### Deliverables

- `docs/PHASE_1_SPLIT.md` — explains the project split and rationale
- `docs/DEVVIT_INTEGRATION_PLAN.md` — full Devvit integration plan and API contracts
- `apps/devvit/` — reserved folder with README for future Devvit app
- `apps/api/app/routers/devvit.py` — five Devvit readiness routes:
  - `GET /devvit/capabilities`
  - `POST /devvit/analyze-thread`
  - `POST /devvit/replay-thread`
  - `POST /devvit/thread-heatmap`
  - `POST /devvit/volatility-check`
- All routes return `automated_action_taken: false`
- Missing data returns `status: "no_data"` with a clear message
- Tests covering capabilities, no-data scenarios, and data scenarios

### Safety Rules

- No destructive moderation actions are exposed or planned
- Every response includes `automated_action_taken: false`
- The Devvit app will expose only analytical actions
- No individual user profiling
- Moderators always review before acting

### Deviations from Phase 1A

Phase 1B adds no new database tables, no new signal calculations, and no frontend changes.

## Next Phase Ideas

- Real Reddit API integration with rate limiting
- WebSocket-based live signal streaming
- Historical data backfill
- Improved sentiment analysis with NLP
- Anomaly detection with statistical thresholds
- Replay scrubber UI in the dashboard
- Export/download signal reports
- Multiple subreddit comparison views
- Devvit app scaffolding and deployment
- OAuth integration for Devvit
- End-to-end Devvit integration testing
