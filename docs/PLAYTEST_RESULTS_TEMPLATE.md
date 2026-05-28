# Playtest Results — Phase 2E Demo Mode

## Test Metadata

| Field | Value |
|---|---|
| Date | 2026-05-28 |
| App version | 0.0.5.1 |
| Backend URL type | demo |
| Tunnel tool (if used) | none (Demo Mode) |
| Test subreddit | r/wrose_sentinel_dev |
| Tested account | moderator (your account) |
| Tested on | web |

## Menu Visibility

| Menu Item | Visible? | Notes |
|---|---|---|
| WROSE: Analyze Thread (post) | Yes | Shield icon, post menu |
| WROSE: Volatility Check (post) | Yes | Shield icon, post menu |
| WROSE: About / Capabilities (subreddit) | Yes | Shield icon, subreddit menu |

## Analyzed Account Types

| Account Type | Menu Visible? | Notes |
|---|---|---|
| Moderator | Yes | All 3 items visible |
| Non-moderator | Not tested | Should NOT be visible per `forUserType: "moderator"` |

## Analyze Thread Results

| Check | Pass/Fail | Notes |
|---|---|---|
| Modal opens | Pass | Form displayed on click |
| Signal values displayed | Pass (Demo) | Demo placeholder shown with status demo_mode |
| Recommended view shown | Pass (Demo) | "review" shown |
| `automated_action_taken: false` present | Pass | Confirmed in demo response |
| SAFETY_STATEMENT present | Pass | "No automated action was taken..." shown |

## Volatility Check Results

| Check | Pass/Fail | Notes |
|---|---|---|
| Modal opens | Pass | Form displayed on click |
| Volatility score displayed | Pass (Demo) | 0.42 placeholder shown |
| Contributing factors shown | Pass (Demo) | 3 factors listed |
| Explanation shown | Pass (Demo) | Demo explanation shown |
| `automated_action_taken: false` present | Pass | Confirmed in demo response |
| SAFETY_STATEMENT present | Pass | "No automated action was taken..." shown |

## About / Capabilities Results

| Check | Pass/Fail | Notes |
|---|---|---|
| Modal opens | Pass | Form displayed on click |
| Available actions listed | Pass | 3 actions listed (analyze, volatility check, capabilities) |
| Limitations listed | Pass | Backend-dependent, local-only |
| Safety boundaries listed | Pass | No destructive actions |
| `automated_action_taken: false` present | Pass | Confirmed |

## Demo Mode Validation

| Check | Pass/Fail | Notes |
|---|---|---|
| Demo Mode result confirmed | Yes | Full Demo Mode validation passed |
| Analyze Thread shows "WROSE Demo Mode" | Pass | Header confirms Demo Mode |
| Analyze Thread shows "Backend not connected" | Pass | Explanation shows "backend is not connected" |
| Volatility Check shows score 0.42 | Pass | Placeholder score displayed |
| Volatility Check shows "WROSE Demo Mode" | Pass | Header confirms Demo Mode |
| `automated_action_taken: false` in Demo Mode response | Pass | Present in both actions |

## Error Handling

| Scenario | Expected | Actual | Pass/Fail |
|---|---|---|---|
| Backend unavailable | Demo Mode response with guidance | Demo Mode displayed with backend not connected message | Pass |
| No data for subreddit | "No stored data found" modal | Not tested (Demo Mode triggers before fetch) | N/A |
| Missing post/subreddit context | "Could not determine" modal | Not tested | N/A |

## Safety Validation

| Check | Pass/Fail | Notes |
|---|---|---|
| No destructive API calls | Pass | No remove/lock/ban/mute/report/approve/distinguish/delete observed |
| `automated_action_taken: false` in every response | Pass | Confirmed in all 3 menu actions |
| `check:safety` passes | Pass | 9 files, 0 violations (pre-upload check) |

## Screenshots

| Screenshot | File |
|---|---|
| Analyze Thread modal | (not captured) |
| Volatility Check modal | (not captured) |
| About / Capabilities modal | (not captured) |
| Backend unavailable modal | Not applicable — Demo Mode |
| Menu items visible | (not captured) |

## Failures

| Failure | Steps to Reproduce | Severity |
|---|---|---|
| None | — | — |

## Fixes Needed

| Fix | Priority | Assigned To |
|---|---|---|
| None in Demo Mode path. Backend-connected mode not tested. | — | — |

## Overall Result

**Pass** — Demo Mode playtest successful. All 3 menu items render, respond, and return safe analytical-only output with `automated_action_taken: false`. Backend-connected mode remains untested.

## Notes

- Playtest was performed via `npx devvit playtest r/wrose_sentinel_dev` on version 0.0.5.1
- Demo Mode activated automatically because `wroseApiBaseUrl` defaulted to `http://127.0.0.1:8000` (localhost)
- No tunnel setup was required
- App has since been updated to v0.0.8 with the same Demo Mode logic hardened in `src/utils/demo.ts`
- Next: backend-connected playtest via tunnel, or next feature phase
