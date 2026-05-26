# WROSE Phase 1

## Scope

- FastAPI backend with SQLite persistence
- Reddit ingestion scaffold with mock data fallback
- Six operational signals with transparent calculation
- Replay timeline generation from ingested data
- React/Vite dark-operational dashboard
- Comprehensive documentation

## Deliverables

- Working API with health, ingestion, subreddit, signals, and replay endpoints
- SQLite database with subreddits, posts, comments, signal_snapshots, anomalies, and replay_frames tables
- Signal engine v0.1 with six aggregate metrics
- Frontend dashboard with subreddit selector, signal cards, activity chart, anomaly feed, replay timeline, and posts table
- Documentation: README, PHASE_1, SIGNAL_DEFINITIONS, ETHICS_AND_BOUNDARIES

## Non-Goals

- Authentication / user accounts
- Payment systems
- Supabase or cloud database
- Automated moderation actions
- User-level profiling or diagnosis
- Truth detection or disinformation labeling
- Real-time WebSocket streaming
- Machine learning models
- Production deployment

## Next Phase Ideas

- Real Reddit API integration with rate limiting
- WebSocket-based live signal streaming
- Historical data backfill
- Improved sentiment analysis with NLP
- Anomaly detection with statistical thresholds
- Replay scrubber UI in the dashboard
- Export/download signal reports
- Multiple subreddit comparison views
