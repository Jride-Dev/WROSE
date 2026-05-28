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

---

## Tunnel Safety (Playtest Only)

### Temporary Nature

- Tunnels are for playtest only
- Start the tunnel only when actively testing
- Stop the tunnel immediately after testing
- Do not leave a tunnel running overnight or indefinitely

### Exposure Boundaries

- The tunnel exposes your local backend to the internet
- Anyone with the tunnel URL can reach the backend — no auth is configured
- Do not expose admin or debug endpoints through the tunnel
- Do not expose secrets through the tunnel
- Devvit readiness routes (`/devvit/*`) are read-only and analytical only

### Safety Invariant

- All Devvit route responses must preserve `automated_action_taken: false`
- The tunnel does not change this invariant
- After tunnel testing, restart the backend to clear any in-memory state

### Shutdown

1. Stop tunnel: Ctrl+C in the tunnel terminal
2. Reset Devvit `wroseApiBaseUrl` to `http://127.0.0.1:8000`
3. If using ngrok with a registered subdomain, consider removing it
4. Monitor for any unexpected traffic after tunnel closure
