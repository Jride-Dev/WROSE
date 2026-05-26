# WROSE Sentinel

WROSE Sentinel is a Reddit-native moderator intelligence assistant for the WROSE project.

It provides analytical moderator tools for understanding thread activity, volatility, and operational signals.

## Current Phase

Phase 2 Devvit scaffold MVP.

## Current Actions

- Analyze Thread
- Volatility Check

## Safety Boundary

WROSE Sentinel does not remove, lock, ban, mute, report, or modify Reddit content.

All analysis responses must preserve:

`automated_action_taken: false`

## Backend

WROSE Sentinel calls the external WROSE backend Devvit readiness API.

## Test Subreddit

Default playtest subreddit:

r/wrose_sentinel_dev
