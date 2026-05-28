# WROSE Sentinel

WROSE Sentinel is a Reddit-native moderator intelligence assistant for the WROSE project.

It provides analytical moderator tools for understanding thread activity, volatility, and operational signals.

## Current Status

- Phase: 2G — Reddit-native UX polish and listing readiness
- Current scaffold version: 0.0.10
- Playtest validated version: v0.0.5.1 (Demo Mode)
- Demo Mode playtest: **Passed** (2026-05-28)
- Backend-connected mode: Not tested
- Public publish: Not ready
- Playtest results: `docs/PLAYTEST_RESULTS_TEMPLATE.md`
- Listing draft: `docs/REDDIT_APP_LISTING_DRAFT.md`

## Playtest Rules

- Playtest only in `r/wrose_sentinel_dev`
- Do not run `npx devvit publish`
- Do not run `npx devvit publish --public`
- Do not run `npm audit fix --force`

## Current Actions

| Action | Location | Description |
|---|---|---|
| WROSE: Analyze Thread | Post menu (moderator only) | Review thread activity signals and recommended moderator view |
| WROSE: Volatility Check | Post menu (moderator only) | Check thread volatility score and contributing factors |
| WROSE: About / Capabilities | Subreddit menu (moderator only) | Learn what WROSE Sentinel can do and check connection status |

## Playtest Subreddit

`r/wrose_sentinel_dev`

## Demo Mode

WROSE Sentinel includes a Demo Mode that works without a backend tunnel. When the WROSE API is not configured or unreachable, the app returns safe placeholder responses instead of a dead-end error.

Demo Mode behavior:
- Works without ngrok or Cloudflare Tunnel
- Verifies Reddit menu actions, forms, and context integration
- Does not perform live backend scoring
- `automated_action_taken` remains `false`
- Each response clearly states Demo Mode is active

Demo Mode triggers:
- `wroseApiBaseUrl` is missing, empty, or set to `localhost`
- The backend URL is configured but the fetch fails (timeout, network error)

When a real backend is configured and reachable, Demo Mode is bypassed and live data is returned.

## Safety Boundary

WROSE Sentinel does **not** remove, lock, ban, mute, report, approve, distinguish, or modify Reddit content.

Every analysis response must preserve:

```
automated_action_taken: false
```

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
| `npm run check:safety` | Passes (10 files, 0 violations) |
| `npx devvit upload` | Succeeds (version 0.0.10) |
| Demo Mode fallback | Active |
| Demo Mode playtest | Passed (2026-05-28) |
| ID normalization | Added — resolves `t3_t3_` duplication |
| Capabilities Demo Mode | Added — no longer dead-ends on backend unreachable |
| UX polish | Phase 2G — standardized output format, moderator-friendly copy |

## Related Docs

- [Devvit Launch Readiness](docs/DEVVIT_LAUNCH_READINESS.md)
- [Reddit App Listing Draft](docs/REDDIT_APP_LISTING_DRAFT.md)
- [Sanity Check Report](docs/SANITY_CHECK_2026-05-28.md)
- [Playtest Checklist](docs/devvit_playtest_checklist.md)
- [Playtest Results](docs/PLAYTEST_RESULTS_TEMPLATE.md)
- [Playtest Plan](docs/PHASE_2D_MANUAL_PLAYTEST.md)

## Audit Warning

Do **not** run `npm audit fix --force` without verifying Devvit compatibility. Vulnerabilities are transitive through `@devvit/public-api` and forced changes may break the scaffold.
