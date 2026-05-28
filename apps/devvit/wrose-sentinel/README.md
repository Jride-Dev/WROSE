# WROSE Sentinel

WROSE Sentinel is a Reddit-native moderator intelligence assistant for the WROSE project.

It provides analytical moderator tools for understanding thread activity, volatility, and operational signals.

## Current Status

- Phase: 2F — Demo Mode polish and ID cleanup
- Current scaffold version: 0.0.8
- Playtest validated version: v0.0.5.1 (Demo Mode)
- Demo Mode playtest: **Passed** (2026-05-28)
- Backend-connected mode: Not tested
- Public publish: Not ready
- Playtest results: `docs/PLAYTEST_RESULTS_TEMPLATE.md`

## Phase 2F — Demo Mode Polish

- Fixed duplicated `t3_` prefix in Post ID display (`t3_t3_...` → `t3_...`)
- Added `normalizeThingId()` helper in `src/utils/id.ts`
- Analyze Thread Demo response now includes `Backend connected: false`
- Volatility Check Demo response now includes `Backend connected: false` and cleaner layout
- Capabilities/info action now has its own Demo Mode fallback (was previously only error on backend unreachable)
- Demo Capabilities clearly lists: what works in Demo Mode, what requires backend, safety boundaries

## Playtest Rules
- Playtest only in `r/wrose_sentinel_dev`
- Do not run `npx devvit publish`
- Do not run `npx devvit publish --public`
- Do not run `npm audit fix --force`

## Current Actions

- Analyze Thread
- Volatility Check

## Playtest Subreddit

`r/wrose_sentinel_dev`

## Safety Boundary

WROSE Sentinel does **not** remove, lock, ban, mute, report, approve, distinguish, or modify Reddit content.

Every analysis response must preserve:

```
automated_action_taken: false
```

## Demo Mode

WROSE Sentinel includes a Demo Mode that works without a backend tunnel. When the WROSE API is not configured or unreachable, the app returns safe placeholder responses instead of a dead-end error.

Demo Mode behavior:
- Works without ngrok or Cloudflare Tunnel
- Verifies Reddit menu actions, forms, and context integration
- Does not perform live backend scoring
- `automated_action_taken` remains `false`
- Each response clearly states "WROSE Demo Mode" and "Backend not connected"

Demo Mode triggers:
- `wroseApiBaseUrl` is missing, empty, or set to `localhost`
- The backend URL is configured but the fetch fails (timeout, network error)

When a real backend is configured and reachable, Demo Mode is bypassed and live data is returned.

## Backend

WROSE Sentinel calls the external WROSE backend Devvit readiness API (`/devvit/analyze-thread`, `/devvit/volatility-check`, `/devvit/capabilities`).

## Local Validation

```bash
npm install
npx tsc --noEmit
npx devvit upload
npm run check:safety
npm audit
```

## Validation Status

| Check | Result |
|---|---|
| `npm install` | Passes (36 packages) |
| `npm run typecheck` | Passes (zero errors) |
| `npm run check:safety` | Passes (9 files, 0 violations) |
| `npx devvit upload` | Succeeds (version 0.0.8) |
| Demo Mode fallback | Active |
| Demo Mode playtest | Passed (2026-05-28) |
| ID normalization (`normalizeThingId`) | Added — resolves `t3_t3_` duplication |
| Capabilities Demo Mode | Added — no longer dead-ends on backend unreachable |

## Playtest Checklist

See `docs/devvit_playtest_checklist.md` for the full manual playtest procedure.

## Audit Warning

Do **not** run `npm audit fix --force` without verifying Devvit compatibility. Vulnerabilities are transitive through `@devvit/public-api` and forced changes may break the scaffold.
