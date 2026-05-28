# WROSE Sentinel

WROSE Sentinel is a Reddit-native moderator intelligence assistant for the WROSE project.

It provides analytical moderator tools for understanding thread activity, volatility, and operational signals.

## Current Status

- Phase: 2 scaffold/playtest
- App version: 0.0.3
- Playtest: Not yet performed
- Public publish: Not ready

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
| `npm run check:safety` | Passes (8 files, 0 violations) |
| `npx devvit upload` | Succeeds (version 0.0.3) |

## Playtest Checklist

See `docs/devvit_playtest_checklist.md` for the full manual playtest procedure.

## Audit Warning

Do **not** run `npm audit fix --force` without verifying Devvit compatibility. Vulnerabilities are transitive through `@devvit/public-api` and forced changes may break the scaffold.
