# Phase 2D: Manual Playtest Plan

## Purpose

Verify that WROSE Sentinel's Devvit menu actions appear correctly in the moderator UI and return expected analytical results from the backend.

This is a dry-run procedure. The playtest has not been run yet.

## Prerequisites

- Devvit CLI installed and logged in
- App uploaded: `npx devvit upload` (from `apps/devvit/wrose-sentinel/`)
- App installed on `r/wrose_sentinel_dev` (via `npx devvit install r/wrose_sentinel_dev`)
- Backend running and reachable through a tunnel
- At least one test post with comments in `r/wrose_sentinel_dev`
- Subreddit `r/wrose_sentinel_dev` has been ingested by the backend
- Tunnel URL configured in Devvit app settings as `wroseApiBaseUrl`

## Terminal Windows Needed

| Window | Command | Purpose |
|---|---|---|
| Terminal 1 | Backend | `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` |
| Terminal 2 | Tunnel | `ngrok http 8000` or `cloudflared tunnel --url http://127.0.0.1:8000` |
| Terminal 3 | Devvit (optional) | `npx devvit logs r/wrose_sentinel_dev` for streaming logs |

## Demo Mode (First Playtest Path)

Demo Mode allows playtesting without a backend tunnel. The app returns safe placeholder responses when the backend is not connected.

When to use Demo Mode:
- First playtest session — verify menu items render and respond
- Backend tunnel not yet set up (ngrok requires account/authtoken)
- Quick validation of Devvit menu action pipeline

In Demo Mode, the app returns:
- Analyze Thread: status `demo_mode`, mock signal placeholders, `automated_action_taken: false`
- Volatility Check: status `demo_mode`, score `0.42`, `automated_action_taken: false`
- Each response clearly states "WROSE Demo Mode" and "Backend not connected"

No special configuration needed. The app defaults to Demo Mode when `wroseApiBaseUrl` is `localhost` (the default setting).

## Backend Startup (Required for Live Mode)

```bash
cd apps/api
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify locally:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok","database":"ok"}
```

## Tunnel Startup (Required for Live Mode)

```bash
# Option A: ngrok
ngrok http 8000
# Copy the https:// forwarding URL

# Option B: Cloudflare Tunnel
cloudflared tunnel --url http://127.0.0.1:8000
# Copy the https:// tunnel URL
```

Verify through tunnel:

```bash
curl https://<tunnel-url>/health
curl https://<tunnel-url>/devvit/capabilities
```

## Devvit Upload

```bash
cd apps/devvit/wrose-sentinel
npx devvit upload
```

## Devvit Playtest Command

> **Manual step — do not run yet.**

```bash
# When ready, run from apps/devvit/wrose-sentinel/:
npx devvit playtest
```

This command installs the app on the playtest subreddit, starts a live session where changes are auto-reloaded, and streams logs.

## Test Subreddit

`r/wrose_sentinel_dev`

## Expected Menu Items

| Label | Location | Visible For |
|---|---|---|
| WROSE: Analyze Thread | Post menu (shield icon) | Moderators only |
| WROSE: Volatility Check | Post menu (shield icon) | Moderators only |
| WROSE: About / Capabilities | Subreddit menu (shield icon) | Moderators only |

## Expected Safe Outputs

### Analyze Thread — Success

A modal form displays:

```
# Thread Analysis — r/wrose_sentinel_dev

## Signals
Activity Velocity:    12.34
Sentiment Drift:      -0.05
Keyword Acceleration: 45.67
Hostility Score:      0.23
Controversy Density:  0.10
Anomaly Score:        0.02

## Recommended View
[explanation text]

---
No automated action was taken. WROSE Sentinel is analytical only.
```

`automated_action_taken: false` must be present.

### Volatility Check — Success

A modal form displays:

```
# Volatility Check — r/wrose_sentinel_dev

Score: 0.3456

## Contributing Factors
- High activity velocity (12.34/hr)
- [other factors]

## Explanation
[explanation text]

---
No automated action was taken. WROSE Sentinel is analytical only.
```

`automated_action_taken: false` must be present.

### About / Capabilities — Success

A modal form displays available actions, limitations, safety boundaries, and `automated_action_taken: false`.

## Expected Backend-Unavailable / Demo Mode Behavior

When the backend is not configured or unreachable, the app returns Demo Mode responses:

### Analyze Thread (Demo Mode)

```
# WROSE Analyze Thread — Demo Mode

**Status:** demo_mode
**Automated action taken:** false

WROSE Sentinel is running in Demo Mode because the backend is not connected.

## Thread Context
Subreddit: r/wrose_sentinel_dev
Post ID: t3_abc123

## Suggested Moderator View
review

## What This Means
This is a local scaffold response. No live backend analysis was performed.
WROSE Sentinel responded from the Devvit app directly to confirm that
menu actions, menu items, forms, and Reddit context integration are working.

---
No automated action was taken. WROSE Sentinel is analytical only.
```

### Volatility Check (Demo Mode)

```
# WROSE Volatility Check — Demo Mode

**Status:** demo_mode
**Volatility Score:** 0.42 (placeholder)
**Automated action taken:** false

WROSE Sentinel is running in Demo Mode because the backend is not connected.

## Contributing Factors
- Backend not connected
- Live signal engine unavailable
- Devvit menu action executed successfully

## Explanation
The volatility check requires a live backend connection to score the thread.
Since the backend is not connected, WROSE Sentinel returned a placeholder
score to confirm the menu action pipeline is working end-to-end.

---
No automated action was taken. WROSE Sentinel is analytical only.
```

`automated_action_taken: false` must be present in every Demo Mode response.

## Expected No-Data Behavior

When the subreddit has not been ingested:

```
No stored data found for r/[subreddit].

Ingest this subreddit first via the WROSE dashboard, then try again.
```

`automated_action_taken: false` must be present.

## Pass/Fail Checklist

### Pre-Playtest — Demo Mode Path (No Tunnel Needed)

All checks below can be performed with `wroseApiBaseUrl` at its default (`http://127.0.0.1:8000`). Demo Mode will activate automatically.

- [ ] App uploaded: `npx devvit upload` succeeds
- [ ] App installed on `r/wrose_sentinel_dev`
- [ ] Test post exists with comments
- [ ] `wroseApiBaseUrl` unchanged (default `localhost`) — Demo Mode will be active

### Pre-Playtest — Live Mode Path (Requires Tunnel)

- [ ] Backend health OK locally: `curl http://127.0.0.1:8000/health`
- [ ] Tunnel active and forwarding
- [ ] Tunnel health OK: `curl https://<tunnel>/health`
- [ ] Tunnel capabilities OK: `curl https://<tunnel>/devvit/capabilities`
- [ ] Devvit `wroseApiBaseUrl` set to tunnel URL
- [ ] App uploaded: `npx devvit upload` succeeds
- [ ] App installed on `r/wrose_sentinel_dev`
- [ ] Test post exists with comments
- [ ] Subreddit ingested

### During Playtest

- [ ] "WROSE: Analyze Thread" appears in post moderator menu
- [ ] "WROSE: Volatility Check" appears in post moderator menu
- [ ] "WROSE: About / Capabilities" appears in subreddit moderator menu
- [ ] Menu actions do NOT appear for non-moderator accounts
- [ ] Analyze Thread returns signal values (live) or Demo Mode response
- [ ] Analyze Thread includes `automated_action_taken: false`
- [ ] Volatility Check returns score and factors (live) or Demo Mode response
- [ ] Volatility Check includes `automated_action_taken: false`
- [ ] Backend-unavailable shows Demo Mode response (not dead-end error)
- [ ] Demo Mode Analyze Thread includes "WROSE Demo Mode" and "Backend not connected"
- [ ] Demo Mode Volatility Check includes score `0.42` and "WROSE Demo Mode"
- [ ] No-data shows "No stored data found" message
- [ ] No destructive API calls observed

### Post-Playtest

- [ ] Tunnel stopped (Ctrl+C)
- [ ] Devvit `wroseApiBaseUrl` reset to `http://127.0.0.1:8000`
- [ ] Results documented in `docs/PLAYTEST_RESULTS_TEMPLATE.md`

## Rollback / Stop Procedure

### Stop playtest session

```bash
# In the playtest terminal, press Ctrl+C to stop
# Or uninstall from the subreddit:
npx devvit uninstall r/wrose_sentinel_dev
```

### Stop tunnel

```bash
# Ctrl+C in the tunnel terminal
```

### Stop backend

```bash
# Ctrl+C in the backend terminal
```

### Full app removal

```bash
npx devvit uninstall r/wrose_sentinel_dev
# Or delete app from: https://developers.reddit.com/apps/wrose-sentinel
```

### Restore settings

```bash
devvit settings set wroseApiBaseUrl http://127.0.0.1:8000
```
