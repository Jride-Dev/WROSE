# WROSE Sentinel

**WROSE Sentinel** is a Reddit-native moderator intelligence assistant that helps moderators understand thread activity, volatility, and escalation signals before a discussion becomes harder to manage.

WROSE Sentinel runs directly inside Reddit using Devvit native analysis. It does not require an external backend to operate.

## Current Status

* **Public status:** Listed in the Reddit App Directory
* **Approved version:** v0.0.34
* **Runtime mode:** Native Devvit analysis
* **Backend required:** No
* **Primary purpose:** Moderator-assist analytics
* **Automated moderation:** None
[![Launched on DevGlobe](https://devglobe.app/badges/launched-on-devglobe-dark.svg)](https://devglobe.app/projects/wrose?utm_source=badge&utm_medium=embed)

WROSE Sentinel is analytical only. It does not remove, lock, report, approve, distinguish, ban, mute, message, or otherwise modify Reddit content.

## What WROSE Sentinel Does

WROSE Sentinel gives moderators compact, readable signals about a Reddit thread, including:

* Comment activity
* Thread volatility
* Engagement relative to score
* Controversial voting patterns
* Recent comment activity
* Hostile language indicators
* Symbol-heavy outbursts
* Multi-participant escalation
* Suggested moderator view: Routine, Monitor, or Review

The goal is not to replace moderator judgment. The goal is to make thread review faster, clearer, and less dependent on guessing where the problem is.

## Available Moderator Actions

| Action                          | Location       | Description                                                                                                                       |
| ------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **WROSE: Analyze Thread**       | Post menu      | Reviews thread activity, comment signals, participant activity, hostility indicators, symbol bursts, and suggested moderator view |
| **WROSE: Volatility Check**     | Post menu      | Calculates a volatility score and shows contributing factors                                                                      |
| **WROSE: About / Capabilities** | Subreddit menu | Shows what the app can do and confirms native analysis status                                                                     |

All actions are available to moderators only.

## Native Devvit Analysis

WROSE Sentinel uses Reddit-native Devvit APIs to read public thread and comment context available to moderators. Analysis happens inside the Devvit app runtime.

The app can operate with the WROSE API Base URL setting left blank.

If a backend URL is configured later, it may be used for future expanded WROSE analysis workflows. The approved public version does not require a backend for core thread analysis.

## Safety Boundary

WROSE Sentinel is designed as a read-only analytical assistant.

It does **not** perform automated moderation actions.

WROSE Sentinel does not:

* Remove posts or comments
* Lock threads
* Ban users
* Mute users
* Report content
* Approve content
* Distinguish moderator comments
* Send messages
* Modify Reddit content

Every analysis response includes a safety notice confirming that no Reddit content was modified.

## Suggested Moderator View

WROSE Sentinel summarizes thread state using moderator-facing labels:

* **Routine** — no significant escalation signals detected
* **Monitor** — activity or signal patterns suggest the thread may need attention
* **Review** — stronger escalation indicators suggest a moderator should inspect the thread

These labels are recommendations only. Moderators remain in control of all decisions.

## Example Output

WROSE Sentinel may show output like:

```text
WROSE: Analyze Thread
Status: native_analysis | Backend: native_devvit

Score: 1
Comments: 26
Activity: 1.27/hr
Upvote ratio: 50%
Engagement: 26
Controversy: 1

Participants: 3
Recent: 0 / 15m · 0 / 60m
Hostile: 3
Symbol bursts: 1
Confidence: medium
Stale: false

Suggested moderator view: Review — significant multi-participant activity
Baseline metadata view: Routine — no significant signals detected
Comment-aware override: Review — significant multi-participant activity

WROSE Sentinel is analytical only. No Reddit content was modified.
```

## Privacy and Data Handling

WROSE Sentinel analyzes public Reddit thread and comment information available through Reddit and Devvit.

The app is intended for moderator workflow support and does not require users to submit private information.

## Project Notes

WROSE Sentinel is part of the broader WROSE project: **Working Reddit Operational Signal Engine**.

The project focuses on moderator intelligence, thread analysis, volatility detection, and operational signal review for Reddit communities.
