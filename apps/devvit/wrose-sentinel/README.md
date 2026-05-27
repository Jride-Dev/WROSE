# WROSE Sentinel

WROSE Sentinel is a Reddit-native moderator intelligence assistant for the WROSE project.

It provides analytical moderator tools for understanding thread activity, volatility, and operational signals.

## Current Phase

Phase 2 scaffold/playtest.

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

## Audit Warning

Do **not** run `npm audit fix --force` without verifying Devvit compatibility. Vulnerabilities are transitive through `@devvit/public-api` and forced changes may break the scaffold.
