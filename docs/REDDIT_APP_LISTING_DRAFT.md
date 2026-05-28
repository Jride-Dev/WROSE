# Reddit App Listing Draft — WROSE Sentinel

## App Name

WROSE Sentinel

## Short Description

Moderator intelligence assistant for analyzing thread activity, volatility signals, and operational patterns. Analytical only — no automated moderation actions.

## Longer Overview

WROSE Sentinel helps moderators understand what is happening in their community by providing operational signal summaries directly in the Reddit moderator interface.

**Analytical Actions**
- **Analyze Thread** — View six operational signals for any thread: activity velocity, sentiment drift, keyword acceleration, hostility score, controversy density, and anomaly score. Includes a recommended moderator view.
- **Volatility Check** — Get a volatility score with contributing factors and explanations to identify threads that may need attention.

**Safety First**
WROSE Sentinel is analytical only. It does not remove, lock, ban, mute, report, approve, distinguish, or modify Reddit content. Every analysis response preserves `automated_action_taken: false`.

**How It Works**
WROSE Sentinel calls a self-hosted WROSE backend API that ingests subreddit data and computes operational signals. The backend must be running and the subreddit must be ingested before analysis is available.

**Current Status**
Phase 2 — private playtest. Not yet ready for public listing.

## Terms URL

https://github.com/Jride-Dev/WROSE/blob/main/docs/TERMS.md

## Privacy URL

https://github.com/Jride-Dev/WROSE/blob/main/docs/PRIVACY.md

## NSFW

false

## Category Suggestion

Moderation / Tooling

## Launch Status

Unlisted / private testing only

## Public Listing

Not ready.

Blockers:
- Manual subreddit playtest not yet performed
- SDK-level vulnerability in `@devvit/public-api` → `@devvit/protos` → `protobufjs` (6 vulnerabilities, 1 critical, no fix available)
- Backend exposure plan not finalized
- Public listing review not submitted
