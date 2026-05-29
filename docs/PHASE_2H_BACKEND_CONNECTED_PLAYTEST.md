# Phase 2H: Backend-Connected Playtest — Blocked

## Status

**BLOCKED** — awaiting Reddit HTTP fetch domain approval.

| Item | Status |
|---|---|
| Local backend | ✅ Working (`uvicorn`, port 8000, 9/9 tests pass) |
| ngrok tunnel | ✅ Working (verified via `curl /devvit/*`) |
| `WROSE_API_BASE_URL` setting | ✅ Read by Devvit runtime |
| Devvit `fetch()` call | ✅ Attempted (confirmed in Devvit logs) |
| `devvit.json` HTTP allowlist | ✅ Uploaded v0.0.19 with domain listed |
| Domain in Developer Settings | ✅ Appears at `https://developers.reddit.com/apps/wrose-sentinel` |
| Domain approval status | ❌ **PENDING** |
| `automated_action_taken: false` | ✅ Confirmed in every response path |
| Devvit form modal sizing | ⚠️ **Known UX issue** — ~4 visible lines, scrolling reveals ~8 total |

## Confirmed Diagnostics

All checks completed 2026-05-28:

### Backend
- `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` starts clean
- `curl http://127.0.0.1:8000/health` returns `{"status": "ok"}`
- `curl http://127.0.0.1:8000/devvit/capabilities` returns valid JSON with `automated_action_taken: false`

### Tunnel
- `ngrok http 8000` starts successfully
- `curl https://unwomanly-myspace-cleat.ngrok-free.dev/devvit/capabilities` returns valid JSON with `automated_action_taken: false`
- Tested both POST endpoints: `analyze-thread` and `volatility-check` return `{"status": "no_data", "automated_action_taken": false}`

### Devvit Config
- `devvit.json` created at `apps/devvit/wrose-sentinel/devvit.json`
- Schema: `https://developers.reddit.com/schema/config-file.v1.json`
- `permissions.http.enable: true`
- `permissions.http.domains: ["unwomanly-myspace-cleat.ngrok-free.dev"]`
- `npx devvit upload --config devvit.json` → v0.0.19 uploaded successfully
- `npx devvit install r/wrose_sentinel_dev` → installed successfully
- Install permission summary includes "Read and write *any* data to and from the internet"
- Legacy `devvit.yaml` removed (replaced by `devvit.json`)

### Developer Settings
- App page: `https://developers.reddit.com/apps/wrose-sentinel`
- Permissions section shows the domain
- Status column: **PENDING** — domain has not been approved by Reddit's infrastructure yet

### App Runtime
- `Devvit.configure({ redditAPI: true, http: true })` confirmed in `main.tsx`
- Menu items fire handlers (confirmed in Demo Mode playtest, Phase 2E)
- Backend-connected fetch is attempted but blocked at runtime with:
  `HTTP request to domain: unwomanly-myspace-cleat.ngrok-free.dev is not allowed`

### Safety
- `automated_action_taken: false` is enforced in every code path:
  - Demo Mode (no backend)
  - `no_data` response (backend reachable but no ingested data)
  - Live response (backend returns signals)
  - Error/catch paths
- No destructive Reddit API calls (no remove, lock, ban, mute, report, approve)
- Safety scanner passes: `node scripts/check-safety.mjs` — 0 destructive patterns in 10 source files

## Blocker: Domain Approval

The ngrok tunnel hostname `unwomanly-myspace-cleat.ngrok-free.dev` appears in Developer Settings under the app's permissions but has status **PENDING**. Until Reddit approves this domain, the Devvit runtime will reject all HTTP `fetch()` calls to it with the error:

```
HTTP request to domain: unwomanly-myspace-cleat.ngrok-free.dev is not allowed
```

### Possible causes of PENDING status
- Domain has never been submitted before — first-time approval may require a review cycle
- Free ngrok hostnames are ephemeral — Reddit may not auto-approve short-lived domains
- The domain may need to be explicitly approved by a Reddit admin via the Developer Settings UI
- There may be no approval workflow at all for free-tier domains — the PENDING status may be terminal

### Mitigations attempted
- ✅ devvit.json `permissions.http.domains` with correct syntax (no protocol, no path, no wildcard)
- ✅ `enable: true` set explicitly
- ✅ App re-uploaded and re-installed
- ❌ Cannot use paid ngrok (no budget for static/reserved domain)
- ❌ Cannot switch to first-party hosted backend (WROSE is self-hosted by design)
- ❌ Cannot bypass approval — it is enforced by Reddit's runtime, not configurable

## Known UX Issue: Form Modal Size

Devvit's form modal is a fixed-size `<textarea>` inside a popup. On desktop the visible area is approximately 4 lines of text. Even after compacting output to remove blank lines and shorten labels, the full response still requires scrolling.

### Example: Analyze Thread (Demo Mode) after compaction
```
# WROSE Analyze Thread (Demo)
Status: demo_mode | Backend: false | Auto-action: false
r/wrose_sentinel_dev · t3_abc123
Suggested view: review
No backend connected. Menu/pipeline working. No live analysis.
No automated action was taken. WROSE Sentinel is analytical only. No Reddit content was modified.
```

That's 6 lines — the last 2 lines are hidden behind the scroll. The label `Info` takes a visible line. Title is in the header.

### Impact
- Moderators must scroll to see the full response
- Key info like `automated_action_taken: false` may be off-screen
- Safety statement is always at the bottom, requires scroll
- Not fixable without Reddit changing the form modal size or providing an alternative UI output mechanism

### Possible future mitigations (non-blocking)
- **Log-based output**: Write results to Redis/console instead of using forms
- **Custom post output**: Create a Devvit custom post to display results (requires Devvit Web/post framework)
- **Push notifications**: Use Devvit's notification API to send results (scope unknown)
- **Separate form per section**: Break results into multiple sequential forms (high friction)

## Next Steps

1. **Wait** for Reddit domain approval. Check periodically at `https://developers.reddit.com/apps/wrose-sentinel`
2. If approval never comes: explore using a static/paid ngrok domain or Cloudflare Tunnel (which may have different approval behavior)
3. If approval comes: re-test backend-connected playtest per `docs/PHASE_2D_MANUAL_PLAYTEST.md`
4. If alternative tunnel changes domain: update `devvit.json` with new hostname, re-upload, re-install, re-check approval
5. Form modal sizing: not fixable from app side; log as known limitation; revisit if Reddit expands the modal

## Related Docs
- `docs/TUNNEL_PLAYTEST_SETUP.md` — Tunnel setup and domain allowlist instructions
- `docs/PHASE_2D_MANUAL_PLAYTEST.md` — Full playtest checklist
- `apps/devvit/wrose-sentinel/devvit.json` — Current app config with pending domain
