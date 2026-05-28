# Backend Exposure Plan

## Problem

WROSE Sentinel runs on Reddit's Devvit runtime (Reddit's servers) but calls a self-hosted WROSE backend API. The backend must be reachable from the Devvit runtime for the app to function.

The default `wroseApiBaseUrl` setting is `http://127.0.0.1:8000`, which only works from the local machine.

## Options

### Option 1: Local Backend Only (Current)

| Aspect | Detail |
|---|---|
| Setup | Run backend on `127.0.0.1:8000` |
| Reachable from Devvit | No — Devvit runs on Reddit's servers |
| Reachable from browser | Yes — when testing via local Reddit session |
| Best for | Backend development, signal engine testing, CORS validation |
| Limitation | Cannot test actual Devvit-to-backend HTTP calls |

### Option 2: Temporary Tunnel (ngrok, etc.)

| Aspect | Detail |
|---|---|
| Setup | `ngrok http 8000` → generates public URL |
| Reachable from Devvit | Yes |
| Security | Tunnel exposes local server to the internet |
| Best for | Manual playtest, Devvit fetch validation |
| Risk | Anyone with the tunnel URL can reach the backend |
| Mitigation | Use authenticated tunnel, limit lifetime, monitor access |

### Option 3: Temporary Deployed Backend

| Aspect | Detail |
|---|---|
| Setup | Deploy backend to temporary host (Render, Railway, Fly.io, etc.) |
| Reachable from Devvit | Yes |
| Security | Depends on deployment configuration |
| Best for | Longer playtest sessions, shared testing |
| Risk | More surface area; database is exposed |
| Mitigation | Use read-only database, ephemeral deployment, destroy after testing |

### Option 4: Production Backend

| Aspect | Detail |
|---|---|
| Setup | Deploy with proper auth, rate limiting, monitoring |
| Reachable from Devvit | Yes |
| Security | Requires proper hardening |
| Best for | Public launch |
| Risk | Highest surface area |
| Mitigation | Auth, rate limiting, audit logging, separate production database |

## Recommended Path for Playtest

1. Start with **Option 1** (local) for local browser testing of the backend
2. Use **Option 2** (ngrok tunnel) for the actual Devvit playtest
3. Re-evaluate for public launch

## Risk Notes

### Do Not Expose Dev Server Publicly Without Understanding Risks

- The WROSE backend CORS is set to `allow_origins=["*"]` — any website can make requests
- The Devvit readiness routes expect unstructured input — validate on the backend before any production exposure
- A public endpoint with no auth can be abused for data scraping or unauthorized analysis

### No Secrets in Frontend or Devvit Source

- API keys, database credentials, and tokens must stay in backend environment variables
- The Devvit app only stores the backend URL — no secrets are embedded in the scaffold
- The `wroseApiBaseUrl` setting is user-configured, not hardcoded

### Backend Should Remain Read-Only/Analytical for Devvit Routes

- Devvit routes (`/devvit/*`) must never accept destructive moderation commands
- All Devvit route responses must include `automated_action_taken: false`
- Backend should reject any request that implies content modification
- Consider adding backend-side validation that blocks destructive patterns even if requested

## Current Decision

During Phase 2, the backend remains local-only (`127.0.0.1:8000`).

A tunnel or deployed backend will be set up when manual playtest is ready to proceed.
