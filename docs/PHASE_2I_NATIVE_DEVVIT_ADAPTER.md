# Phase 2I: Native Devvit Sentinel Adapter

## Background

Reddit rejected both requested HTTP fetch domains for WROSE Sentinel:

- `wrose-api.jri-techyes.top` — Cloudflare Tunnel (rejected)
- `unwomanly-myspace-cleat.ngrok-free.dev` — ngrok tunnel (rejected)

Reddit's HTTP Fetch policy states that personal/unregistered domains will not be approved by default. This blocks external backend communication from the Devvit runtime.

## Solution: Native Devvit Analysis

Rather than rely on an external backend tunnel, WROSE Sentinel now performs analysis natively inside the Devvit runtime using the Reddit post context available through `context.reddit.getPostById()`.

This makes WROSE Sentinel fully testable inside Reddit without any HTTP fetch, tunnel, or external backend dependency.

## Architecture

```
┌──────────────────────────────────────────────────┐
│              WROSE Sentinel (Devvit)              │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Analyze   │  │ Volatility│  │ Capabilities   │  │
│  │ Thread    │  │ Check     │  │                │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │              │               │            │
│  ┌────▼──────────────▼───────────────▼────────┐  │
│  │         Native Devvit Engine                │  │
│  │  (src/utils/native.ts)                       │  │
│  │  extractThreadContext()                      │  │
│  │  computeVolatilityScore()                    │  │
│  │  suggestModeratorView()                      │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  External Backend (optional, behind flag)    │  │
│  │  (src/utils/api.ts + HTTP fetch)              │  │
│  │  Only activated if Reddit approves domain    │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘

                   ┌──────────────────┐
                   │  WROSE Signal Lab │
                   │  (apps/api)       │
                   │  External FastAPI │
                   │  + SQLite          │
                   └──────────────────┘
```

### Default Path (Native Devvit)

1. User triggers menu action from a Reddit post
2. App retrieves post data via `context.reddit.getPostById()`
3. Native engine extracts: title, score, upvote ratio, comment count, age
4. Scoring functions compute v0.1 signals from available context
5. Result displayed in a modal form — no external communication needed

### Optional Path (External Backend)

1. If `wroseApiBaseUrl` is configured AND not localhost
2. App attempts HTTP fetch to external WROSE backend
3. If fetch succeeds, full WROSE signal suite is displayed
4. If fetch fails, falls back to native analysis

## Native Signals

### Analyze Thread

Returns:
- `status: native_analysis`
- `backend: native_devvit`
- Subreddit and normalized post ID
- Basic thread context: score, comments, activity velocity (/hr), upvote ratio, engagement ratio, controversy indicator
- Suggested moderator view based on signal thresholds
- `automated_action_taken: false`

### Volatility Check

v0.1 formula using only Devvit-native context:

```
velocityFactor = min(commentsPerHour / 10, 1)            # weight: 0.4
controversyFactor = 1 - |upvoteRatio - 0.5| * 2          # weight: 0.35
engagementFactor = min(comments / max(score, 1) / 5, 1)  # weight: 0.25

volatilityScore = velocity * 0.4 + controversy * 0.35 + engagement * 0.25
```

- velocityFactor: 0-1, 10+ comments/hour = max score
- controversyFactor: 0-1, 0.5 ratio = most controversial (1.0), 0 or 1 = unanimous (0)
- engagementFactor: 0-1, discussion-heavy threads score higher

### Capabilities

Distinguishes:
- **Native Devvit capabilities** (available now without external fetch)
- **External WROSE Engine capabilities** (require backend tunnel + approved domain)

## External WROSE Engine (Preserved)

The FastAPI backend at `apps/api` remains the WROSE signal lab:
- Full 6-signal operational suite
- Cross-thread historical analysis
- Sentiment drift, keyword acceleration, activity replay
- SQLite storage

It is not deleted or rewritten. External backend integration code in `src/utils/api.ts` is preserved behind an optional feature path but is not the default.

## Safety

- `automated_action_taken: false` is enforced in every code path
- No destructive Reddit moderation actions are implemented
- Safety checker (`npm run check:safety`) scans for violations
- Native analysis uses only read-only Reddit API calls

## Files Changed

| File | Change |
|------|--------|
| `src/utils/native.ts` | **New** — native analysis engine |
| `src/actions/analyzeThread.ts` | Updated — native default, external fallback |
| `src/actions/volatilityCheck.ts` | Updated — native default, external fallback |
| `src/actions/capabilities.ts` | Updated — native capabilities with external distinction |
| `src/main.tsx` | Updated — removed HTTP configure, no default backend URL |
| `devvit.json` | Updated — removed HTTP permissions (domains rejected) |
| `.env.example` | Updated — reflects native-first architecture |
| `scripts/test-native.mjs` | **New** — validates scoring math |
| `docs/PHASE_2I_NATIVE_DEVVIT_ADAPTER.md` | **New** — this document |

## Validation

```bash
npm install
npm run typecheck
npm run check:safety
node scripts/test-native.mjs
npx devvit upload --config devvit.json
npx devvit install r/wrose_sentinel_dev
npx devvit playtest r/wrose_sentinel_dev
```
