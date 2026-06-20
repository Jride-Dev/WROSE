# WROSE Sentinel — Devvit App

**Status**: Phase 2 — MVP scaffold with two moderator-only analytical actions.

[![Launched on DevGlobe](https://devglobe.app/badges/launched-on-devglobe-dark.svg)](https://devglobe.app/projects/wrose?utm_source=badge&utm_medium=embed)

## Overview

WROSE Sentinel is a Reddit-native moderator intelligence assistant. It exposes analytical menu actions that call the WROSE backend API. All actions are read-only and analytical — no automated moderation.

## Actions

| Menu Item | Location | Description |
|---|---|---|
| WROSE: Analyze Thread | Post menu (mod only) | Returns 6 aggregate signals with explanations |
| WROSE: Volatility Check | Post menu (mod only) | Returns volatility score with contributing factors |
| WROSE: About / Capabilities | Subreddit menu (mod only) | Shows available actions, limitations, safety boundaries |

## Requirements

- **WROSE backend** running and reachable from Reddit's servers
- **Node.js 18+** for development
- **Devvit CLI**: `npm install -g devvit`
- A **private test subreddit** where you are a moderator

## Local Development

### 1. Install dependencies

```bash
cd apps/devvit/wrose-sentinel
npm install
```

### 2. Build the app

```bash
npm run build
# or: npx devvit build
```

### 3. Upload to Reddit

```bash
npx devvit upload
```

### 4. Install on test subreddit

```bash
npx devvit install r/YOUR_TEST_SUBREDDIT
```

### 5. Configure backend URL

1. Go to your test subreddit on Reddit
2. Open Mod Tools → Mod Tools → Installed Apps
3. Find WROSE Sentinel → Settings
4. Set the **WROSE API Base URL** to your backend address (e.g., `http://198.51.100.1:8000`)

### 6. Test

1. Navigate to any post in your test subreddit
2. Open the moderator menu (shield icon)
3. Click **WROSE: Analyze Thread** or **WROSE: Volatility Check**
4. View the results modal

## Test Subreddit Workflow

```
1. Create a private subreddit (e.g., r/WROSETest)
2. Install Devvit CLI:  npm install -g devvit
3. Build app:           npm run build
4. Upload:              npx devvit upload
5. Install:             npx devvit install r/WROSETest
6. Ingest via backend:  curl -X POST http://localhost:8000/ingest/subreddit/WROSETest
7. Navigate to a post in r/WROSETest
8. Open mod menu → test both actions
9. Verify safety statement is displayed
```

## Safety

- **All actions are analytical only.** No remove, lock, ban, mute, report, or content modification.
- Every response displays: `No automated action was taken.`
- Menu items are only visible to moderators (`forUserType: "moderator"`).
- The app requests `Post` scope only — read-only access to post data.
- No elevated permissions (no ModMail, Wiki, or Config access).
- No user-level profiling — all analysis is aggregate.

## Backend Dependency

This app requires a running WROSE backend instance. It calls:

| Route | Method | Purpose |
|---|---|---|
| `/devvit/capabilities` | GET | Backend connectivity check |
| `/devvit/analyze-thread` | POST | Analyze Thread action |
| `/devvit/volatility-check` | POST | Volatility Check action |

The backend URL is configured via Devvit app settings (default: `http://127.0.0.1:8000`).

## Troubleshooting

| Problem | Solution |
|---|---|
| "Backend not responding" | Check WROSE API is running: `curl http://localhost:8000/health` |
| "No data found for subreddit" | Ingest the subreddit via the WROSE dashboard or API |
| Menu items not appearing | Verify you are a moderator of the subreddit |
| Upload fails | Run `npx devvit login` to authenticate |
| Actions time out | Check network connectivity between Reddit and your backend |

## Project Files

```
src/
  main.tsx                    # App entry, menu item registration
  actions/
    analyzeThread.ts          # Analyze Thread action
    volatilityCheck.ts        # Volatility Check action
    capabilities.ts           # Capabilities fetch action
  components/
    ResultBlock.tsx           # Shared result display helper
    ErrorBlock.tsx            # Shared error display helper
  utils/
    api.ts                    # Backend HTTP client
    safety.ts                 # Safety invariant helpers
devvit.yaml                   # App manifest
```

## Non-Goals (Phase 2)

- Replay Thread action
- Thread Heatmap action
- Narrative Acceleration
- Automated moderation (never)
- Production deployment
- Devvit store listing
- Real-time streaming
