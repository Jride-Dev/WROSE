# WROSE Ethics and Boundaries

## What WROSE Does

- **Analyze public subreddit-level activity** — WROSE only ingests and processes data that is publicly available via the Reddit API. It does not access private subreddits, direct messages, or user profiles.

- **Provide aggregate operational signals** — All signals are computed at the subreddit level. Metrics such as activity velocity, sentiment drift, and hostility score describe collective patterns, not individual behavior.

- **Help moderators and analysts understand activity patterns** — WROSE is designed as an observability tool for community moderators, researchers, and analysts who want to understand trends in public subreddit activity.

- **Support replay/explain/observe workflows** — Every signal includes an explanation field describing how it was computed. The replay timeline allows reviewing historical signal states.

## What WROSE Does NOT Do

- **Diagnose users** — WROSE never profiles, scores, or diagnoses individual users. Author fields are hashed. No individual behavior prediction is performed.

- **Predict individual behavior** — All analysis is aggregate. WROSE does not attempt to predict what any specific person will do.

- **Dox or identify users** — Author identifiers are one-way hashed. WROSE does not attempt to map authors to real identities.

- **Automate bans** — WROSE produces signals and anomalies for human review. It does not take automated moderation actions.

- **Label political beliefs** — No political classification or ideological labeling is performed.

- **Sell personal profiles** — WROSE is local-first and does not share data with third parties.

- **Claim truth detection** — WROSE does not claim to detect misinformation, disinformation, or "truth." It measures observable engagement patterns only.

## Privacy Boundaries

- All data is stored locally in SQLite. No data is sent to external services.
- Author identifiers are stored as one-way hashes. Original usernames are not retained.
- Reddit credentials, if configured, are stored in local environment variables only.
- No cookies, tracking, or analytics are embedded in the dashboard.

## Moderator-Support Framing

WROSE is a transparency tool, not a surveillance weapon. Its purpose is to help moderators and researchers observe patterns in public community activity. The replay and explain features ensure that every signal can be traced back to its inputs.

If you are a moderator using WROSE, we encourage you to:
- Communicate with your community about what tools you use
- Never take automated actions based solely on WROSE signals
- Review anomalies manually before any intervention
- Use WROSE as one input among many, not as a decision engine
