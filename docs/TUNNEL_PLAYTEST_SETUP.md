# Tunnel Playtest Setup

## Overview

WROSE Sentinel needs to reach the WROSE backend from Reddit's Devvit runtime. Since the Devvit runtime runs on Reddit's servers, it cannot reach `127.0.0.1:8000` on your machine.

A tunnel creates a public HTTPS URL that forwards requests to your local backend.

## Prerequisites

- WROSE backend installed and working locally
- One of the following installed: `ngrok` or `cloudflared`

---

## Option A: ngrok

### Step 1: Start the Backend

```bash
cd apps/api
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 2: Start ngrok Tunnel

In a separate terminal:

```bash
ngrok http 8000
```

### Step 3: Copy the Forwarding URL

ngrok displays:

```
Forwarding    https://abc123.ngrok.io -> http://127.0.0.1:8000
```

Copy the `https://abc123.ngrok.io` URL.

### Step 4: Configure Devvit App

1. Go to the Devvit app page: `https://developers.reddit.com/apps/wrose-sentinel`
2. Open app settings
3. Set `wroseApiBaseUrl` to your ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Save

Or, if you have the Devvit CLI and the app is already installed:

```bash
devvit settings set wroseApiBaseUrl https://abc123.ngrok.io
```

### Step 5: Verify Tunnel Is Working

```bash
curl https://abc123.ngrok.io/health
curl https://abc123.ngrok.io/devvit/capabilities
```

Both should return valid JSON responses.

### Step 6: Proceed to Playtest

Follow `docs/devvit_playtest_checklist.md` for the manual playtest steps.

---

## Option B: Cloudflare Tunnel

### Step 1: Start the Backend

```bash
cd apps/api
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 2: Install cloudflared

If not already installed:

```bash
# Windows (winget)
winget install cloudflare.cloudflared

# Or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

### Step 3: Run the Tunnel

```bash
cloudflared tunnel --url http://127.0.0.1:8000
```

### Step 4: Copy the Tunnel URL

cloudflared displays something like:

```
https://random-name.trycloudflare.com
```

Copy this URL.

### Step 5: Configure Devvit App

Same as Option A Step 4, but use the Cloudflare tunnel URL.

### Step 6: Verify Tunnel Is Working

```bash
curl https://random-name.trycloudflare.com/health
curl https://random-name.trycloudflare.com/devvit/capabilities
```

Both should return valid JSON responses.

---

## Safety Controls

- **Short-lived session**: Stop the tunnel when playtest is done. Do not leave it running.
- **Random subdomain**: ngrok generates random subdomains by default — use this, not a fixed subdomain.
- **Monitor access**: ngrok provides an inspector at `http://127.0.0.1:4040` — check it during playtest.
- **No secrets exposed**: The backend has no auth on Devvit routes. Anyone with the tunnel URL can call it.
- **Read-only routes**: Only Devvit readiness routes (`/devvit/*`) are exposed — these are analytical only.
- **No admin endpoints**: Do not expose debug or admin endpoints through the tunnel.

## Shutdown

After testing:

1. Stop the tunnel (Ctrl+C in the tunnel terminal)
2. Update Devvit app settings back to `http://127.0.0.1:8000`
3. Keep the backend running only if needed for local development

## Troubleshooting

### Tunnel starts but /health returns nothing

- Is the backend running? Check `curl http://127.0.0.1:8000/health` locally first
- Is the backend on port 8000? Verify the uvicorn command

### Devvit app still cannot reach the backend

- Verify the URL in Devvit settings does not have a trailing slash
- Verify the URL uses `https://` (tunnels require HTTPS)
- Check ngrok inspector at `http://127.0.0.1:4040` for incoming requests

### Devvit HTTP domain not allowed

If diagnostics show `HTTP request to domain: ... is not allowed`:

1. Add the tunnel hostname to `apps/devvit/wrose-sentinel/devvit.json` under `permissions.http.domains`:
   ```json
   "permissions": {
     "http": {
       "enable": true,
       "domains": ["your-tunnel-hostname.ngrok-free.dev"]
     }
   }
   ```
2. Re-run `npx devvit upload --config devvit.json` to apply
3. Re-run `npx devvit install r/wrose_sentinel_dev` to deploy the updated version

**Important:** `devvit.json` replaces the legacy `devvit.yaml` and is the only format that properly submits HTTP domains for approval. The legacy `devvit.yaml` `permissions.http.domains` field is not recognized by the current runtime and will silently fail — domains must be declared in `devvit.json`.

### Checking approved domains

Visit **Developer Settings > Apps > wrose-sentinel > Permissions** at `https://developers.reddit.com/apps/wrose-sentinel` to see which domains have been approved or are pending review. After uploading with `devvit.json`, the domain list should appear here.

### Free ngrok URLs require per-session config

Free ngrok URLs change every tunnel session. Each new hostname requires:
1. Update `devvit.json` `permissions.http.domains` (exact hostname only, no `https://`, no path, no trailing slash, no wildcard)
2. Re-run `npx devvit upload --config devvit.json`
3. Re-run `npx devvit install r/wrose_sentinel_dev`

### Tunnel is slow

- ngrok free tier is rate-limited
- Cloudflare Tunnel free tier is generally faster
- For slow connections, test with minimal data first
