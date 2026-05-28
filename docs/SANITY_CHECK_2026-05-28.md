# Sanity Check Report — 2026-05-28

## Metadata

| Field | Value |
|---|---|
| Date | 2026-05-28 |
| Commit checked | `f196632` ("Remove duplicate Devvit audit artifact") |
| Performed by | Post-Phase-2F automated checks |

## Git Status

- Working tree: **Clean** — no uncommitted changes
- No accidental root `package.json` / `package-lock.json` files present
- Duplicate `apps/devvit/wrose-sentinel/npm-audit-devvit.txt` has been removed from tracking

## Backend Result

| Check | Result |
|---|---|
| `python -m pytest tests/test_devvit.py` | **9 passed** in 1.00s |
| `GET /health` | `{"status": "ok", "database": "ok"}` |
| `GET /devvit/capabilities` | Returns capabilities with `automated_actions_enabled: false`, `automated_action_taken: false` |
| Backend warnings | 5 deprecation warnings: `on_event` (FastAPI), `datetime.utcnow()` (Python 3.14) |

## Frontend Result

| Check | Result |
|---|---|
| `npm install` | 171 packages, 0 vulnerabilities |
| `npm run build` | **Success** — 648 modules, 2.89s (chunk size advisory only: 547 KB > 500 KB) |

## Devvit Result

| Check | Result |
|---|---|
| `npm install` | 36 packages, 6 vulnerabilities (transitive, known) |
| `npm run typecheck` | **Passed** — zero errors |
| `npm run check:safety` | **Passed** — 10 files scanned, 0 destructive patterns found |
| `npx devvit upload` | **Succeeded** — version bumped to 0.0.10 |
| All 3 menu items registered | Yes — Analyze Thread, Volatility Check, About / Capabilities |

## Docs Result

All 9 required docs present:
- `docs/PHASE_2D_MANUAL_PLAYTEST.md` ✓
- `docs/PLAYTEST_RESULTS_TEMPLATE.md` ✓
- `docs/DEVVIT_SECURITY_NOTES.md` ✓
- `docs/devvit_npm_audit.txt` ✓
- `docs/TERMS.md` ✓
- `docs/PRIVACY.md` ✓
- `docs/BACKEND_EXPOSURE_PLAN.md` ✓
- `docs/TUNNEL_PLAYTEST_SETUP.md` ✓
- `docs/REDDIT_APP_LISTING_DRAFT.md` ✓

## Security / Audit Note

- `npm audit` reports 6 vulnerabilities (5 high, 1 critical) through `@devvit/public-api` → `@devvit/protos` → `protobufjs`
- These are **transitive** with no fix available upstream
- `npm audit fix --force` was not run (would risk Devvit compatibility)
- Safety scanner confirms **zero destructive Reddit API patterns** in all 10 source files
- `automated_action_taken: false` is enforced in every response path (demo mode, live backend, error)
- No `remove`, `lock`, `ban`, `mute`, `report`, `approve`, `distinguish`, or `delete` calls exist in Devvit source

## Remaining Known Issues

| Issue | Status |
|---|---|
| Backend-connected mode not yet tested | Untested — tunnel setup (ngrok auth) required |
| Devvit SDK / protobufjs audit vulnerabilities (5 high, 1 critical) | Transitive, no fix available — blocks public listing |
| Public publish / listing blocked | Yes — awaiting playtest completion, audit resolution, and Reddit review |
| FastAPI `on_event` deprecation | Low priority — does not affect functionality |
| `datetime.utcnow()` deprecation | Low priority — affects 3 test paths, Python 3.14 only |
| Frontend chunk size (547 KB) | Advisory only — no functional impact |
| Demo Mode validated | **Passed** — Phase 2E confirmed, Phase 2F polish applied |

## Final Recommendation

The repository is **healthy and ready for continued development**. All layers pass:

- **Backend**: Tests pass (9/9), API responds, safety flags are `false`
- **Frontend**: Builds clean (0 vulnerabilities)
- **Devvit**: Typechecks, safety-passed, uploads (v0.0.10)
- **Docs**: All 9 required files present
- **Git**: Clean working tree, no accidental root artifacts

**Recommended next step**: Set up backend tunnel (ngrok with auth token or Cloudflare Tunnel) and perform the backend-connected playtest to validate the live signal pipeline end-to-end.
