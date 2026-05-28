# WROSE Sentinel Playtest Checklist

## Test Environment

| Item | Value |
|---|---|
| Playtest subreddit | `r/wrose_sentinel_dev` |
| Subreddit URL | `https://www.reddit.com/r/wrose_sentinel_dev/` |
| Devvit app page | `https://developers.reddit.com/apps/wrose-sentinel` |
| Developer account role | App owner, moderator of subreddit |
| Moderator account | Must have full moderation permissions on the test subreddit |
| Backend host | `http://127.0.0.1:8000` (default) |
| App version | `0.1.0` |
| Phase | Phase 2 scaffold/playtest |

## Prerequisites

- [ ] Devvit CLI installed (`npm install -g devvit`)
- [ ] Logged into Devvit (`devvit login`)
- [ ] App uploaded (`npx devvit upload` from `apps/devvit/wrose-sentinel/`)
- [ ] App installed on test subreddit (`npx devvit install r/wrose_sentinel_dev` or via playtest)
- [ ] WROSE backend running locally

## Test Post Setup

Create at least one test post in `r/wrose_sentinel_dev` with a few comments so the backend has data to analyze.

If the backend has no data for the subreddit, the "no data" behavior can be tested on a subreddit that has not been ingested.

## Backend Startup

```bash
cd apps/api
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Menu Actions Verified

The Devvit app registers the following moderator-only menu actions:

| Menu Label | Location | forUserType | Type |
|---|---|---|---|
| WROSE: Analyze Thread | Post | moderator | Analytical action |
| WROSE: Volatility Check | Post | moderator | Analytical action |
| WROSE: About / Capabilities | Subreddit | moderator | Informational only |

Only **Analyze Thread** and **Volatility Check** are thread-level analytical actions.
**About / Capabilities** is an informational utility menu item that displays app capabilities.

## Expected Behavior

### Normal flow (data available, backend running)

1. Navigate to a post in `r/wrose_sentinel_dev`
2. Open the moderator menu (shield icon)
3. Click **WROSE: Analyze Thread**
4. Observe: modal dialog displays signal values (activity velocity, sentiment drift, keyword acceleration, hostility score, controversy density, anomaly score) and recommended moderator view
5. Verify: `automated_action_taken: false` is displayed
6. Close the modal
7. Click **WROSE: Volatility Check**
8. Observe: modal dialog displays volatility score, contributing factors, and explanation
9. Verify: `automated_action_taken: false` is displayed

### No data behavior (subreddit not ingested)

1. Open moderator menu on a post in a subreddit that has not been ingested
2. Click **WROSE: Analyze Thread** or **WROSE: Volatility Check**
3. Observe: modal displays "No stored data found for r/[subreddit]. Ingest this subreddit first via the WROSE dashboard."

### Backend unavailable behavior

1. Stop the WROSE backend
2. Open moderator menu on a post
3. Click **WROSE: Analyze Thread** or **WROSE: Volatility Check**
4. Observe: modal displays "WROSE backend is not responding. Ensure your WROSE API server is running."
5. Verify: `automated_action_taken: false` is included in the error message

## Safety Validation

- [ ] `npm run check:safety` passes (no destructive API patterns in source)
- [ ] All source files scanned: `src/main.tsx`, `src/actions/`, `src/components/`, `src/utils/`
- [ ] No `remove`, `lock`, `ban`, `mute`, `report`, `approve`, `distinguish`, `delete` API calls in implementation
- [ ] `automated_action_taken: false` is enforced in every analysis response path
- [ ] `SAFETY_STATEMENT` is appended to all result displays
- [ ] `checkAutomationFlag()` validates every backend response
- [ ] `buildErrorPayload()` and `buildNoDataPayload()` include `automated_action_taken: false`

## Validation Commands

Run from `apps/devvit/wrose-sentinel/`:

```bash
npm install
npm run typecheck
npm run check:safety
npm audit          # review vulnerabilities (do not force-fix)
npx devvit upload  # re-upload after changes
```

## Backend Exposure Validation

Before playtest, validate that the backend is reachable through the tunnel:

- [ ] Backend running locally: `curl http://127.0.0.1:8000/health` returns OK
- [ ] Tunnel active: tunnel process is running in a terminal
- [ ] Tunnel health: `curl <tunnel-url>/health` returns OK
- [ ] Tunnel capabilities: `curl <tunnel-url>/devvit/capabilities` returns valid JSON
- [ ] Devvit settings: `wroseApiBaseUrl` is set to the tunnel HTTPS URL (not `127.0.0.1`)
- [ ] Tunnel URL uses `https://`
- [ ] Tunnel URL has no trailing slash
- [ ] `automated_action_taken: false` is present in tunnel capabilities response

After playtest:

- [ ] Tunnel stopped: Ctrl+C in tunnel terminal
- [ ] Devvit `wroseApiBaseUrl` reset to `http://127.0.0.1:8000`
- [ ] No unexpected traffic observed in tunnel logs

See `docs/TUNNEL_PLAYTEST_SETUP.md` for detailed tunnel setup steps.

## Do Not Do

- Do not run `npx devvit publish`
- Do not run `npx devvit publish --public`
- Do not run `npm audit fix --force`
- Do not add destructive moderation actions
