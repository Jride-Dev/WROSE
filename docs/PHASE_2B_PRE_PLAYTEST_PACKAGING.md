# Phase 2B: Pre-Playtest Packaging

## Current Status

| Item | Status |
|---|---|
| Phase 2A hardening | Complete, committed |
| Devvit upload | Succeeds (version 0.0.3) |
| `npm install` | Passes (36 packages) |
| `npm run typecheck` | Passes (zero errors) |
| `npm run check:safety` | Passes (8 files, 0 violations) |
| `npm audit` | 6 vulnerabilities (5 high, 1 critical) — no fix available |
| Backend `/health` | OK |
| Backend `/devvit/capabilities` | OK |
| Playtest | Not yet performed |
| Public publish | Blocked |

## What Is Ready

- Devvit scaffold uploads and installs on `r/wrose_sentinel_dev`
- Two analytical moderator menu actions: **Analyze Thread** and **Volatility Check**
- One informational utility menu action: **About / Capabilities**
- Safety scanner validates no destructive API patterns
- TypeScript compiles with zero errors
- Backend Devvit readiness routes are functional

## What Is Not Tested Yet

- Menu item visibility in the Reddit moderator UI (mobile and web)
- Actual HTTP fetch from Devvit runtime to local backend
- Data display formatting in Devvit forms
- No-data behavior when subreddit is not ingested
- Backend-unavailable error handling
- Behavior when `wroseApiBaseUrl` setting is misconfigured
- Multi-user or concurrent moderator access
- Edge cases (empty threads, deleted posts, very large threads)

## Manual Playtest Steps (for later execution)

### Prerequisites

1. Devvit CLI installed and logged in
2. App uploaded: `npx devvit upload` (from `apps/devvit/wrose-sentinel/`)
3. App installed: `npx devvit install r/wrose_sentinel_dev`
4. Backend running: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` (from `apps/api/`)
5. At least one test post with comments in `r/wrose_sentinel_dev`
6. Test subreddit ingested via WROSE backend

### Menu Visibility Check

1. Log into Reddit as a moderator of `r/wrose_sentinel_dev`
2. Navigate to any post in the subreddit
3. Open the moderator menu (shield icon)
4. Verify **WROSE: Analyze Thread** and **WROSE: Volatility Check** appear
5. Navigate to the subreddit front page
6. Open the moderator menu
7. Verify **WROSE: About / Capabilities** appears

### Functional Testing

1. Click **WROSE: Analyze Thread** on a post
2. Verify a modal displays with signal values
3. Verify `automated_action_taken: false` appears
4. Click **WROSE: Volatility Check** on the same post
5. Verify a modal displays with volatility score and factors
6. Verify `automated_action_taken: false` appears

### No-Data Testing

1. Create or identify a subreddit that has NOT been ingested
2. Install WROSE Sentinel on that subreddit (or use a separate install)
3. Click any WROSE action
4. Verify "No stored data found" message appears
5. Verify `automated_action_taken: false` is present

### Backend-Unavailable Testing

1. Stop the WROSE backend
2. Click any WROSE action
3. Verify "WROSE backend is not responding" message appears
4. Verify `automated_action_taken: false` is included in the error

### Non-Moderator Visibility

1. Log into Reddit as a non-moderator user
2. Verify WROSE menu actions do NOT appear

## Expected Menu Actions

| Label | Location | User Type | Behavior |
|---|---|---|---|
| WROSE: Analyze Thread | Post | moderator | Displays 6 signal values + recommendation |
| WROSE: Volatility Check | Post | moderator | Displays volatility score + factors |
| WROSE: About / Capabilities | Subreddit | moderator | Displays app capabilities from backend |

## Expected Safe Responses

- Every analysis modal includes `automated_action_taken: false`
- Every error modal includes `automated_action_taken: false`
- No `remove`, `lock`, `ban`, `mute`, `report`, `approve`, `distinguish`, `delete` API calls
- Safety scanner enforces this at build time

## Known Limitations

- Vulnerabilities in `protobufjs` transitive dependency (via `@devvit/public-api`) — no fix available
- Backend must be running and reachable from Devvit — not suitable for standalone use
- Backend must have ingested the subreddit before analysis
- Signal engine uses lexicon-based sentiment, not NLP
- No real-time streaming — data must be ingested first
- SQLite storage — not optimized for high throughput
- No custom post or webview UI — uses form modals only

## Backend Dependency Requirement

WROSE Sentinel requires a running WROSE backend:

- Default URL: `http://127.0.0.1:8000`
- Configurable via app settings (`wroseApiBaseUrl`)
- Required routes: `GET /devvit/capabilities`, `POST /devvit/analyze-thread`, `POST /devvit/volatility-check`
- Backend must be reachable from the Devvit runtime

## Localhost / Tunnel Warning

The default `wroseApiBaseUrl` is `http://127.0.0.1:8000`.

- This works when testing from a local Reddit session on the same machine
- Devvit runtime runs on Reddit's servers — `127.0.0.1` will NOT resolve from Reddit's network
- For playtest, the backend must be reachable from the Devvit runtime:
  - Use a tunnel (ngrok, etc.) to expose localhost
  - OR deploy the backend to a temporary public host
  - OR use Reddit's devvit playtest mode if it supports local routing
- Do NOT expose the backend publicly without understanding the security risks
- See `BACKEND_EXPOSURE_PLAN.md` for options

## No-Publish Boundary

- Do **not** run `npx devvit publish`
- Do **not** run `npx devvit publish --public`
- Do **not** submit for Reddit review
- Do **not** public-list the app
- Playtest is private to the developer and test subreddit
