# Playtest Results

## Test Metadata

| Field | Value |
|---|---|
| Date | |
| App version | |
| Backend URL type | local / tunnel / deployed / demo |
| Tunnel tool (if used) | ngrok / Cloudflare Tunnel / other |
| Test subreddit | |
| Tested account | |
| Tested on | mobile / web / both |

## Menu Visibility

| Menu Item | Visible? | Notes |
|---|---|---|
| WROSE: Analyze Thread (post) | Yes / No | |
| WROSE: Volatility Check (post) | Yes / No | |
| WROSE: About / Capabilities (subreddit) | Yes / No | |

## Analyzed Account Types

| Account Type | Menu Visible? | Notes |
|---|---|---|
| Moderator | Yes / No | |
| Non-moderator | Yes / No | Should NOT be visible |

## Analyze Thread Results

| Check | Pass/Fail | Notes |
|---|---|---|
| Modal opens | | |
| Signal values displayed | | |
| Recommended view shown | | |
| `automated_action_taken: false` present | | |
| SAFETY_STATEMENT present | | |

## Volatility Check Results

| Check | Pass/Fail | Notes |
|---|---|---|
| Modal opens | | |
| Volatility score displayed | | |
| Contributing factors shown | | |
| Explanation shown | | |
| `automated_action_taken: false` present | | |
| SAFETY_STATEMENT present | | |

## About / Capabilities Results

| Check | Pass/Fail | Notes |
|---|---|---|
| Modal opens | | |
| Available actions listed | | |
| Limitations listed | | |
| Safety boundaries listed | | |
| `automated_action_taken: false` present | | |

## Demo Mode Validation

| Check | Pass/Fail | Notes |
|---|---|---|
| Demo Mode result confirmed | Yes / No | |
| Analyze Thread shows "WROSE Demo Mode" | | |
| Analyze Thread shows "Backend not connected" | | |
| Volatility Check shows score 0.42 | | |
| Volatility Check shows "WROSE Demo Mode" | | |
| `automated_action_taken: false` in Demo Mode response | | |

## Error Handling

| Scenario | Expected | Actual | Pass/Fail |
|---|---|---|---|
| Backend unavailable | Error modal with guidance | | |
| No data for subreddit | "No stored data found" modal | | |
| Missing post/subreddit context | "Could not determine" modal | | |

## Safety Validation

| Check | Pass/Fail | Notes |
|---|---|---|
| No destructive API calls | | |
| `automated_action_taken: false` in every response | | |
| `check:safety` passes | | |

## Screenshots

| Screenshot | File |
|---|---|
| Analyze Thread modal | |
| Volatility Check modal | |
| About / Capabilities modal | |
| Backend unavailable modal | |
| Menu items visible | |

## Failures

| Failure | Steps to Reproduce | Severity |
|---|---|---|
| | | critical / high / medium / low |
| | | |

## Fixes Needed

| Fix | Priority | Assigned To |
|---|---|---|
| | | |
| | | |

## Overall Result

Pass / Partial Fail / Fail

## Notes

(Any additional observations, unexpected behavior, or improvement suggestions.)
