# Devvit Launch Readiness

## Reddit Review Expectations
Before launch, WROSE Sentinel must:
- work on mobile and web
- be tested from developer, moderator, and regular user accounts
- have stable UX flows
- include a clear README
- avoid confusing or destructive moderation behavior
- batch version updates before publishing
- use `npx devvit publish` only when ready for review

## Public Listing Requirements
If WROSE Sentinel is listed publicly later, it must include:
- comprehensive app overview
- installer-facing instructions
- changelog for major updates
- clear explanation that actions are analytical only

## WROSE-Specific Launch Rule
WROSE Sentinel cannot launch publicly unless every moderator-facing response preserves:

`automated_action_taken: false`

No remove, lock, ban, mute, report, or content modification.

## Security Vulnerability Gate

WROSE Sentinel cannot be submitted for public review or public listing while unresolved critical SDK-level vulnerabilities remain unless Reddit documents them as non-exploitable in the Devvit runtime context.

## Phase 2A Validation Status

| Item | Status |
|---|---|
| Devvit upload | Succeeds (version 0.0.3) |
| `npm install` | Passes |
| `npm run typecheck` | Passes (zero errors) |
| `npm run check:safety` | Passes (no destructive API patterns) |
| `npm audit` | 6 vulnerabilities (5 high, 1 critical) — no fix available |
| Backend `/health` | OK |
| Backend `/devvit/capabilities` | OK |
| Manual playtest | Not yet performed |
| Public publish | Blocked until manual subreddit testing passes |

## Launch Blockers

1. **Manual playtest not performed.** Public publish is blocked until the app is manually tested on a private subreddit and all menu actions, error states, and edge cases are confirmed working.
2. **SDK-level vulnerability.** Public listing is blocked until the `protobufjs` transitive vulnerability (via `@devvit/public-api`) is resolved or Reddit documents it as non-exploitable in the Devvit runtime context.
3. **Backend exposure plan not finalized.** The app requires a reachable backend. The deployment/tunnel strategy must be decided before playtest can proceed.
