# WROSE Sentinel — Devvit App (Reserved)

This directory is reserved for the future **WROSE Sentinel** Devvit app.

## Purpose

WROSE Sentinel will be a Reddit-native moderator intelligence assistant that helps moderators understand chaotic conversations through replay, signal analysis, escalation visibility, anomaly surfacing, and thread heatmaps.

## Planned Integration

- The Devvit app will expose moderator menu actions within Reddit
- Actions call the WROSE backend API for analysis
- All actions are analytical only — no destructive moderation

## Status

**Phase 1B**: Backend API contracts and readiness layer complete.

The actual Devvit app has not been initialized or deployed. This folder will be populated when Devvit development begins.

## Future Moderator Actions

- Analyze Thread
- Replay Escalation
- Show Activity Heatmap
- Flag Sudden Volatility
- View Narrative Acceleration

## Safety

WROSE Sentinel does not take destructive moderation actions automatically. All responses from the WROSE backend include `automated_action_taken: false`.
