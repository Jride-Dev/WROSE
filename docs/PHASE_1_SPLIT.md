# WROSE Phase 1 Split

## Why the Project is Split

WROSE development is split into Phase 1A and Phase 1B to maintain focus and avoid overbuilding.

Phase 1A delivered the core WROSE engine. Phase 1B prepares WROSE to integrate with Reddit's native moderator platform (Devvit) without building or deploying the full Devvit app yet.

This split ensures:
- The core engine is stable and validated before adding integration layers
- The Devvit readiness layer can be reviewed for safety boundaries independently
- A future Phase 1C or Phase 2 can build the actual Devvit app on top of well-defined contracts

## Phase 1A: External WROSE Engine

### Completed

- FastAPI backend with SQLite persistence
- Six operational signals: activity_velocity, sentiment_drift, keyword_acceleration, hostility_score, controversy_density, anomaly_score
- Reddit ingestion scaffold with deterministic mock data
- Replay timeline generation
- React/Vite dashboard with dark operational UI
- Documentation: README, PHASE_1, SIGNAL_DEFINITIONS, ETHICS_AND_BOUNDARIES

### Architecture

- External web app running outside Reddit
- Manual ingestion via API calls
- Dashboard for exploring signals and replay data
- No Reddit-native integration

## Phase 1B: Devvit Readiness Layer

### What This Phase Prepares

- API contract definitions for future Devvit moderator actions
- Backend routes that will eventually be called by a Devvit app
- Safety boundaries: automated_action_taken is always false
- Clear separation between analysis and moderation actions
- Placeholder Devvit app folder for future development

### Key Decisions

- All Devvit readiness routes return `automated_action_taken: false`
- No destructive moderation actions are exposed or planned
- The future WROSE Sentinel app will be analysis-only
- Missing data is handled gracefully with a `no_data` status

### Deviations from Phase 1A

Phase 1B adds no new database tables, no new signal calculations, and no frontend changes. It is purely a backend API extension and documentation layer.

## What Remains Out of Scope

- Building and deploying the actual Devvit app
- Automated moderation actions
- Reddit API OAuth flows for Devvit
- Real-time WebSocket or event-driven updates
- Performance optimization for large subreddits
- Production deployment
- User authentication
- Payment systems
