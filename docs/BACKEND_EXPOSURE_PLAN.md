# Backend Exposure Plan

## Problem

WROSE Sentinel runs on Reddit's Devvit runtime (Reddit's servers) but calls a self-hosted WROSE backend API. The backend must be reachable from the Devvit runtime for the app to function.

The default `wroseApiBaseUrl` setting is `http://127.0.0.1:8000`, which only works from the local machine.

## Localhost Limitation

`127.0.0.1` (localhost) always refers to the machine making the request.

- When you click a Devvit menu item in your browser, the Devvit runtime runs on Reddit's servers
- From Reddit's servers, `127.0.0.1:8000` points to Reddit's own localhost, not yours
- Therefore the Devvit app cannot reach your local backend without a tunnel

## Options

### Option 1: Local Backend Only (Current)

| Aspect | Detail |
|---|---|
| Setup | Run backend on `127.0.0.1:8000` |
| Reachable from Devvit | No |
| Reachable from browser | Yes — when testing via local Reddit session |
| Best for | Backend development, signal engine testing, CORS validation |
| Limitation | Cannot test actual Devvit-to-backend HTTP calls |

### Option 2: Temporary Tunnel (ngrok / Cloudflare Tunnel) — Recommended for Playtest

| Aspect | Detail |
|---|---|
| Setup | Run tunnel from localhost to public HTTPS URL |
| Reachable from Devvit | Yes |
| Reachable from browser | Yes |
| Security | Tunnel exposes local server to the internet |
| Best for | Manual playtest, Devvit fetch validation |
| Risk | Anyone with the tunnel URL can reach the backend |
| Mitigation | Use short-lived tunnel, monitor access, restrict routes |

See `docs/TUNNEL_PLAYTEST_SETUP.md` for detailed setup instructions.

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
2. Use **Option 2** (ngrok or Cloudflare Tunnel) for the actual Devvit playtest
3. Re-evaluate for public launch

## Expected Backend URL Format

The `wroseApiBaseUrl` setting expects a URL pointing to the backend root. Examples:

```
http://127.0.0.1:8000                  # local only — Devvit cannot reach
https://abc123.ngrok.io                # ngrok tunnel — Devvit can reach
https://wrose-tunnel.example.com       # Cloudflare Tunnel — Devvit can reach
https://wrose-api.fly.dev              # deployed backend — Devvit can reach
```

The URL must not include a trailing path like `/api/v1`. The Devvit app appends route paths (e.g., `/devvit/capabilities`).

## Risk Notes

### Do Not Expose Dev Server Publicly Without Understanding Risks

- The WROSE backend CORS is set to `allow_origins=["*"]` — any website can make requests
- The Devvit readiness routes expect unstructured input — validate on the backend before any production exposure
- A public endpoint with no auth can be abused for data scraping or unauthorized analysis

### Devvit HTTP Domain Allowlist

Reddit's Devvit runtime requires every backend hostname to be allowlisted in `devvit.yaml` under `permissions.http.domains`:

```yaml
permissions:
  http:
    domains:
      - your-tunnel-hostname.ngrok-free.dev
```

- Free ngrok URLs change each session — each new hostname requires a `devvit.yaml` update and `npx devvit upload`
- Cloudflare Tunnel URLs are similarly dynamic
- The domain entry must be the bare hostname (no `https://` prefix, no path)
- For production, use a fixed domain or wildcard entry

### Safety Controls for Tunnel Use

- Use a short-lived tunnel session — do not leave it running indefinitely
- Use unique, non-guessable tunnel URLs (ngrok generates random subdomains by default)
- Do not share the tunnel URL publicly
- Monitor tunnel access logs during playtest
- Restart the backend after tunnel testing to clear any in-memory state

### Shutdown Procedure

After playtest:

1. Stop the tunnel process (Ctrl+C)
2. If using ngrok with a fixed subdomain, consider removing it
3. Keep the backend running only if needed for local development
4. Update the Devvit app settings back to `http://127.0.0.1:8000` or remove the tunnel URL

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

A tunnel will be set up when manual playtest is ready to proceed. See `docs/TUNNEL_PLAYTEST_SETUP.md` for setup steps.
