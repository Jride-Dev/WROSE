# Devvit Security Notes

## Current Finding

The WROSE Sentinel Devvit scaffold currently reports npm audit findings through the Devvit SDK dependency chain.

Affected chain:

- `@devvit/public-api`
- `@devvit/protos`
- `protobufjs`

Audit result:
- 6 vulnerabilities
- 5 high
- 1 critical
- no fix currently available through `npm audit fix`

## Current Decision

Do not run `npm audit fix --force`.

Reason:
The vulnerable dependency is transitive through the Devvit SDK. Forcing dependency changes may break Devvit compatibility.

## Risk Boundary

WROSE Sentinel currently remains in private scaffold/playtest development.

No public publish.
No public listing.
No production launch.
No payments.
No destructive moderation actions.

## Mitigation Plan

Before public launch:

1. Re-run `npm audit`.
2. Check for updated Devvit packages.
3. Update Devvit SDK only through compatible package versions.
4. Re-run:
   - `npm install`
   - `npx tsc --noEmit`
   - `npx devvit upload`
5. Confirm no scaffold/runtime breakage.
6. Confirm audit status is acceptable or documented.

## Rule

Do not publish WROSE Sentinel publicly while unresolved critical SDK-level vulnerabilities remain unless Reddit explicitly documents the issue as non-exploitable in Devvit runtime context.
