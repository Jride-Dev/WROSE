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
