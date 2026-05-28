# Reddit App Listing Draft — WROSE Sentinel

## App Name

WROSE Sentinel

## Short Description

WROSE Sentinel helps moderators review thread volatility, activity spikes, and signal context without taking moderation action. Built for explainable community awareness.

## Longer Overview

WROSE Sentinel helps moderators understand what is happening in their community by providing operational signal summaries directly in the Reddit moderator interface.

**Analytical Actions**
- **Analyze Thread** — View six operational signals for any thread: activity velocity, sentiment drift, keyword acceleration, hostility score, controversy density, and anomaly score. Includes a recommended moderator view.
- **Volatility Check** — Get a volatility score with contributing factors and explanations to identify threads that may need attention.

**Safety First**
WROSE Sentinel is analytical only. It does not remove, lock, ban, mute, report, approve, distinguish, or modify Reddit content. Every analysis response preserves `automated_action_taken: false`.

**How It Works**
WROSE Sentinel calls a self-hosted WROSE backend API that ingests subreddit data and computes operational signals. The backend must be running and the subreddit must be ingested before analysis is available.

**Demo Mode**
WROSE Sentinel includes a Demo Mode that works without a backend connection. In Demo Mode, the app returns safe placeholder responses to confirm menu actions and form display are working. No live signal data is shown, but moderators can verify the app is installed and responsive.

## Short Description (under 200 chars)

WROSE Sentinel helps moderators review thread volatility, activity spikes, and signal context without taking moderation action. Built for explainable community awareness.

## Terms URL

https://github.com/Jride-Dev/WROSE/blob/main/docs/TERMS.md

## Privacy URL

https://github.com/Jride-Dev/WROSE/blob/main/docs/PRIVACY.md

## NSFW

false

## Category Suggestion

Moderation / Tooling

## Current Version

0.0.10

## Current Status

Private / playtest only

| Check | Status |
|---|---|
| Demo Mode validated | Yes |
| Backend-connected mode validated | No |
| Public listing readiness | Not ready |

## Public Listing Blockers

- Backend-connected mode not tested (requires tunnel setup)
- SDK / protobufjs transitive audit issue remains (6 vulnerabilities, 5 high, 1 critical — no fix available)
- Mobile / web cross-account testing not complete
- README and listing assets not final
- Reddit app review not submitted
