# WROSE Phase 2: Devvit Scaffold MVP

## Goal

Build the first WROSE Sentinel Devvit scaffold MVP that exposes two moderator-only analytical actions inside Reddit's native moderator interface:

1. **Analyze Thread** — Returns aggregate signals for the current thread
2. **Volatility Check** — Returns volatility score with contributing factors

The Devvit app calls the existing WROSE backend readiness routes (`POST /devvit/analyze-thread`, `POST /devvit/volatility-check`, `GET /devvit/capabilities`) and displays results within Reddit's UI.

---

## Core Constraints

| Constraint | Requirement |
|---|---|
| Automated moderation | NOT allowed. No remove, lock, ban, mute, report. |
| `automated_action_taken` | Must always be `false` in every response. |
| App scope | Read-only. Must request `Post` read permission only. |
| Trigger surfaces | Moderator menu only (not post footer, not subreddit feed). |
| Backend dependency | Requires self-hosted WROSE API running and reachable. |
| Data dependency | Subreddit must have been ingested via the WROSE backend first. |

---

## Architecture

```
┌───────────────────────┐
│    Reddit Frontend    │
│                       │
│  ┌─────────────────┐  │     HTTPS/JSON      ┌─────────────────────┐
│  │  WROSE Sentinel │───── POST /devvit/* ──>│   WROSE API         │
│  │  Devvit App     │<──── Response ────────│   (Self-hosted)     │
│  └─────────────────┘  │                     └─────────────────────┘
│                       │                              │
│  Moderator clicks     │                     ┌───────┴───────┐
│  "Analyze Thread"     │                     │   SQLite DB   │
│  in post menu         │                     └───────────────┘
└───────────────────────┘
                              Automated actions: NEVER
                              automated_action_taken: false
```

---

## Implementation Steps

### Step 1: Install Devvit CLI

```bash
npm install -g devvit
devvit --version  # verify installation
```

### Step 2: Scaffold Devvit App

```bash
cd F:\WROSE\apps\devvit
devvit new wrose-sentinel
```

This creates:
```
apps/devvit/wrose-sentinel/
  src/
    main.tsx           # App entry point
  devvit.yaml          # App manifest
  package.json
  tsconfig.json
```

### Step 3: Configure App Manifest

Edit `devvit.yaml`:

- Set `name: wrose-sentinel`
- Set `version: 0.1.0`
- Set `scope: Post` (read-only)
- Add description referencing WROSE backend dependency
- No `ModMail`, `Wiki`, or `Config` scopes
- No elevated permissions

### Step 4: Implement Capabilities Fetch

In `src/main.tsx`:

- On app install/init, call `GET /devvit/capabilities` to verify backend connectivity
- Store capabilities result for display in the "About" section
- Handle backend-unreachable gracefully with a user-facing message

### Step 5: Implement Moderator Menu

```typescript
// Menu item registration
Devvit.addMenuItem({
  label: 'WROSE: Analyze Thread',
  location: 'post',
  onPress: async (context) => {
    // Only available to moderators
    if (!context.isMod) return;
    // Show analyze-thread form
  },
});

Devvit.addMenuItem({
  label: 'WROSE: Volatility Check',
  location: 'post',
  onPress: async (context) => {
    if (!context.isMod) return;
    // Show volatility-check form
  },
});
```

Only register menu items when `context.isMod === true`. No actions trigger from non-mod users.

### Step 6: Implement Analyze Thread Action

When a moderator clicks "WROSE: Analyze Thread":

1. Open a `useForm` modal displaying "Analyzing thread..."
2. Call `POST /devvit/analyze-thread` with subreddit name and post ID
3. Display results in a read-only form:
   - Activity Velocity
   - Sentiment Drift
   - Keyword Acceleration
   - Hostility Score
   - Controversy Density
   - Anomaly Score
   - Recommended Moderator View
   - Note: "No automated action was taken."

Handle error states:
- Backend unreachable → "WROSE backend is not responding. Ensure your WROSE API server is running."
- No data for subreddit → "No stored data found for this subreddit. Ingest this subreddit first via the WROSE dashboard."
- HTTP error → "Analysis failed. Check backend logs."

### Step 7: Implement Volatility Check Action

When a moderator clicks "WROSE: Volatility Check":

1. Open a `useForm` modal displaying "Checking volatility..."
2. Call `POST /devvit/volatility-check` with subreddit name and post ID
3. Display results in a read-only form:
   - Volatility Score (0.0–1.0)
   - Contributing Factors (e.g., "High activity velocity (51.0/hr)")
   - Explanation
   - Note: "No automated action was taken."

Same error handling as Analyze Thread.

### Step 8: Add Backend URL Configuration

The Devvit app needs the backend URL. Add a configurable setting:

- Use `Devvit.addSettings` to allow the moderator to set the WROSE API base URL
- Default: `http://127.0.0.1:8000`
- Stored per-install via Devvit's settings API

### Step 9: Verify All Responses Include automated_action_taken: false

Check every response path:

- Successful analyze-thread response → includes `automated_action_taken: false`
- Successful volatility-check response → includes `automated_action_taken: false`
- No data response → includes `automated_action_taken: false`
- Error response → add `automated_action_taken: false` in Devvit error handler

### Step 10: Test on a Private Test Subreddit

Create (or use existing) private subreddit for testing:

1. Create `r/WROSETest` or similar (private, moderator-only)
2. Install the Devvit app on the test subreddit
3. Configure the backend URL in app settings
4. Ingest the test subreddit via the WROSE backend
5. Test both menu actions as moderator

### Step 11: Document the Test Results

After testing, update this doc and/or create a validation report.

---

## File Structure After Phase 2

```
F:\WROSE
  apps/
    api/                          # Unchanged from Phase 1
    frontend/                     # Unchanged from Phase 1
    devvit/
      .gitkeep
      README.md                   # Updated to reflect Phase 2 status
      wrose-sentinel/             # NEW: Devvit scaffold
        src/
          main.tsx                # Entry point, menu items, actions
          actions/
            analyzeThread.ts      # Analyze Thread action
            volatilityCheck.ts    # Volatility Check action
            capabilities.ts       # Capabilities fetch
          components/
            ResultBlock.tsx       # Shared result display helper
            ErrorBlock.tsx        # Shared error display helper
          utils/
            api.ts                # Backend HTTP client
            safety.ts             # Safety invariant helper
        devvit.yaml               # App manifest
        package.json
        tsconfig.json
        .env                      # Devvit install-time settings
  sql/                            # Unchanged
  docs/
    PHASE_2_DEVVIT_SCAFFOLD.md    # THIS FILE
    demo/                         # Unchanged
    ...                           # Other docs unchanged
```

---

## Expected Devvit Files Detail

### `src/main.tsx`
- Imports Reddit Devvit SDK
- Registers menu items for "Analyze Thread" and "Volatility Check"
- Calls backend via fetch
- Renders results in read-only `useForm` modals

### `src/utils/api.ts`
- `async function fetchCapabilities(baseUrl: string)`
- `async function analyzeThread(baseUrl: string, subreddit: string, postId: string)`
- `async function volatilityCheck(baseUrl: string, subreddit: string, postId: string)`
- All functions return typed responses
- All include timeout handling

### `src/utils/safety.ts`
- `function assertNoAutomation(response: any): void` — validates `automated_action_taken` is `false`
- `const SAFETY_STATEMENT = "No automated action was taken."` — appended to all displays

### `devvit.yaml`
```yaml
name: wrose-sentinel
version: 0.1.0
versionName: Phase 2 MVP
description: "Moderator intelligence assistant. Analyzes thread signals and volatility. Requires self-hosted WROSE backend."
author: "WROSE"
scope: Post
# No elevated permissions
dependencies:
  - "@devvit/apps"
settings:
  - name: wroseApiBaseUrl
    label: "WROSE API Base URL"
    type: string
    defaultValue: "http://127.0.0.1:8000"
    scope: app
```

---

## Backend Config Requirements

The existing Phase 1B backend routes do not need modification for Phase 2.

The Devvit app depends on:

| Route | Method | Used For |
|---|---|---|
| `/devvit/capabilities` | GET | Backend connectivity check |
| `/devvit/analyze-thread` | POST | Analyze Thread action |
| `/devvit/volatility-check` | POST | Volatility Check action |

**CORS**: The backend already has `allow_origins=["*"]` which is required for Devvit fetch calls.

**No new database tables, models, or endpoints are required.**

---

## Local Test Subreddit Workflow

### Setup

1. Create a private subreddit (e.g., `r/WROSETest`)
2. Install Devvit CLI: `npm install -g devvit`
3. Scaffold app: `devvit new wrose-sentinel` in `apps/devvit/`
4. Implement the two menu actions as described above
5. Upload app to Reddit: `devvit upload`

### Installation

6. Install app on test subreddit: `devvit install r/WROSETest`
7. Log in to Reddit as moderator of `r/WROSETest`
8. Navigate to any post in the test subreddit
9. Open the moderator menu (shield icon)

### Testing

10. Click "WROSE: Analyze Thread"
11. Observe results modal — verify all signals display with explanations
12. Verify "No automated action was taken." is displayed
13. Click "WROSE: Volatility Check"
14. Observe results modal — verify volatility score and factors display
15. Verify "No automated action was taken." is displayed

### Edge Case Testing

16. Stop the WROSE backend
17. Click any WROSE Sentinel action
18. Verify the error message is shown gracefully

---

## Validation Checklist

- [ ] Devvit CLI installed and functional
- [ ] `devvit new wrose-sentinel` scaffolds cleanly
- [ ] App manifest (`devvit.yaml`) has correct permissions (Post scope only)
- [ ] Menu items only appear for moderators (`context.isMod`)
- [ ] Menu items do NOT appear for non-moderators
- [ ] `GET /devvit/capabilities` is called on init to verify backend
- [ ] `POST /devvit/analyze-thread` returns correct signal data
- [ ] `POST /devvit/volatility-check` returns correct volatility data
- [ ] Both actions display results in read-only `useForm` modal
- [ ] Both actions display "No automated action was taken."
- [ ] Backend unreachable shows graceful error message
- [ ] No data for subreddit shows graceful error message
- [ ] Every API response includes `automated_action_taken: false`
- [ ] No remove, lock, ban, mute, or report actions are exposed
- [ ] App uploads cleanly: `devvit upload`
- [ ] App installs on test subreddit: `devvit install r/WROSETest`
- [ ] Existing WROSE backend routes still pass all tests
- [ ] Frontend still builds without errors
- [ ] Backend tests still pass

---

## Non-Goals

| Item | Out of Scope |
|---|---|
| Replay Thread action | Phase 2+ |
| Thread Heatmap action | Phase 2+ |
| Narrative Acceleration | Phase 2+ |
| Automated moderation | NEVER |
| User-level analysis | NEVER |
| Real-time streaming | Future phase |
| WebSocket support | Future phase |
| Historical backfill | Future phase |
| Multi-subreddit comparison | Future phase |
| Production deployment | Future phase |
| Devvit store listing | Future phase |
| OAuth/authentication | Future phase |

---

## Rollback Plan

### If the Devvit upload fails:
1. Check `devvit login` status — re-authenticate if needed
2. Verify `devvit.yaml` has valid syntax
3. Check for scope/permission issues in the manifest
4. Reduce to a single menu item and retry

### If the app installs but actions don't trigger:
1. Verify backend URL setting in Devvit install settings
2. Check backend is running: `curl http://127.0.0.1:8000/health`
3. Check CORS headers on backend (should already allow all origins)
4. Check Devvit logs: `devvit logs r/WROSETest`
5. If backend URL issue, update the setting and retry

### If the app produces incorrect data:
1. Verify subreddit data via the WROSE dashboard
2. Re-ingest subreddit data via the WROSE backend
3. Check signal engine computations in backend logs

### Full rollback:
1. `devvit uninstall r/WROSETest`
2. Delete `apps/devvit/wrose-sentinel/`
3. Revert `apps/devvit/README.md` to Phase 1B version

---

## Phase 2 Checklist Summary

```
[ ] Step 1: Install Devvit CLI
[ ] Step 2: Scaffold app
[ ] Step 3: Configure devvit.yaml
[ ] Step 4: Implement capabilities fetch
[ ] Step 5: Register moderator menu items
[ ] Step 6: Implement Analyze Thread
[ ] Step 7: Implement Volatility Check
[ ] Step 8: Add backend URL settings
[ ] Step 9: Verify safety invariant
[ ] Step 10: Test on private subreddit
[ ] Step 11: Document test results
[ ] Step 12: Update apps/devvit/README.md
[ ] Step 13: Run backend tests (must still pass)
[ ] Step 14: Build frontend (must still pass)
[ ] Step 15: Commit Phase 2
```

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Devvit CLI install failure | Low | Use Node 18+, check npm permissions |
| Backend unreachable from Devvit | Medium | Require LAN/public URL config; test with ngrok if needed |
| Permission denied on upload | Low | Ensure Devvit account has developer access |
| Action fails on large threads | Medium | Devvit fetch timeout; add 10s timeout in api.ts |
| Reddit API changes break Devvit | Low | Pin Devvit SDK version in package.json |

---

## Phase 2A — Devvit Scaffold Hardening

| Item | Status |
|---|---|
| Devvit upload | Succeeded |
| Playtest subreddit | `r/wrose_sentinel_dev` created |
| App page | `https://developers.reddit.com/apps/wrose-sentinel` |
| App README | Added |
| `npm install` | Succeeds |
| `npx tsc --noEmit` | Passes with zero errors |
| `npm audit` | 6 vulnerabilities (5 high, 1 critical) through `@devvit/public-api` → `@devvit/protos` → `protobufjs` |
| Force-fix decision | Do **not** run `npm audit fix --force` — transitive through Devvit SDK; forced changes may break compatibility |
| Safety validation script | `scripts/check-safety.mjs` added |
| Security notes | `docs/DEVVIT_SECURITY_NOTES.md` created |
| Validation report | `docs/devvit_validation.md` created |

### Safety Validation Requirements Before Further Feature Work

1. `npm install` must succeed
2. `npx tsc --noEmit` must pass with zero errors on source files
3. `npm run check:safety` must pass (no destructive API patterns in implementation)
4. `npm audit` status must be reviewed and documented
5. No `remove`, `lock`, `ban`, `mute`, `report`, `approve`, `distinguish`, or `delete` API calls in implementation code
6. Every analysis response path must preserve `automated_action_taken: false`

### Known Blockers for Phase 3+

- `npm audit` reports 6 vulnerabilities (5 high, 1 critical) through `@devvit/public-api` → `@devvit/protos` → `protobufjs`
- No fix available upstream. Not actionable until Devvit SDK publishes a patch.
- WROSE Sentinel must not be published publicly while critical vulnerabilities are unresolved unless Reddit documents them as non-exploitable in the Devvit runtime.

---

## Devvit SDK Correction

During scaffold validation, `@devvit/apps` was found to be unavailable as a public npm dependency.

WROSE Sentinel now uses:

- `@devvit/public-api`

Validation:
- `npm install` succeeds
- `npx tsc --noEmit` passes with zero errors

Note:
Current Reddit documentation emphasizes `devvit.json` for app configuration. If the working scaffold uses `devvit.yaml`, confirm CLI compatibility before upload/publish and migrate to `devvit.json` if required by the installed Devvit version.
