# WROSE Sentinel — Devvit Integration Plan

## Name

**WROSE Sentinel** — A Reddit-native moderator intelligence assistant.

## Purpose

WROSE Sentinel will help moderators understand chaotic conversations through replay, signal analysis, escalation visibility, anomaly surfacing, and thread heatmaps. It is designed as an analytical overlay, not an automated moderation bot.

## Future Moderator Actions

All actions are analytical only — no destructive moderation is performed.

| Action | Description |
|---|---|
| Analyze Thread | Returns aggregate signals for a thread: sentiment, hostility, controversy, anomaly detection |
| Replay Escalation | Shows how signals evolved over a thread's lifetime in replayable frames |
| Show Activity Heatmap | Visualizes comment/post density and signal intensity over time buckets |
| Flag Sudden Volatility | Detects rapid changes in hostility, velocity, or keyword patterns |
| View Narrative Acceleration | Tracks keyword frequency shifts to surface coordinated or rapidly changing topics |

## Architecture

```
┌─────────────┐     HTTP/JSON      ┌───────────────┐     SQL     ┌─────────┐
│ Devvit App  │ ──────────────────> │  WROSE API    │ ──────────> │ SQLite  │
│ (WROSE      │ <────────────────── │  (FastAPI)    │ <────────── │  DB     │
│  Sentinel)  │     Responses       └───────────────┘             └─────────┘
└─────────────┘
```

- The Devvit app runs inside Reddit's infrastructure
- It calls the WROSE API via HTTP requests to a self-hosted backend
- The API queries the local SQLite database and returns signal data
- All responses include `automated_action_taken: false`

## Safety Rules

1. WROSE Sentinel does not take destructive moderation actions automatically
2. Every API response includes `automated_action_taken: false`
3. The Devvit app exposes only "analyze" and "view" menu actions
4. No ban, remove, lock, mute, report, or other destructive actions
5. All signals are aggregate — no individual user profiling
6. Moderators always review before acting on any signal

## API Contracts

See `docs/DEVVIT_INTEGRATION_PLAN.md` for full contract details.

### Capabilities

```
GET /devvit/capabilities
```

Returns available actions, limitations, and safety boundaries.

### Analyze Thread

```
POST /devvit/analyze-thread
```

Takes subreddit, post_id, and optional comment_id. Returns signal snapshot with explanations.

### Replay Thread

```
POST /devvit/replay-thread
```

Takes subreddit, post_id, and optional time_window. Returns replay timeline frames.

### Thread Heatmap

```
POST /devvit/thread-heatmap
```

Takes subreddit and optional post_id. Returns heatmap buckets with signal intensity data.

### Volatility Check

```
POST /devvit/volatility-check
```

Takes subreddit, post_id, and optional comment_id. Returns volatility score with contributing factors.

## Implementation Status

- [x] Backend API routes (Phase 1B)
- [ ] Reddit Devvit app scaffolding
- [ ] OAuth integration
- [ ] Karma/safety checks
- [ ] UI components within Reddit
- [ ] End-to-end testing
- [ ] Devvit store listing preparation
