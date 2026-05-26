# WROSE Phase 1 Demo Script

## Prerequisites

- Backend running at `http://127.0.0.1:8000`
- Frontend running at `http://localhost:5173`
- No Reddit credentials required (mock data fallback)

---

## Step 1: Health Check

```bash
curl http://127.0.0.1:8000/health
```

**Expected:** `{"status":"ok","database":"ok"}`

**Actual:**
```json
{"status": "ok", "database": "ok"}
```

---

## Step 2: Ingest a Subreddit (Mock Data)

```bash
curl -X POST http://127.0.0.1:8000/ingest/subreddit/demodemo
```

**Expected:** Posts and comments ingested from mock source.

**Actual:**
```json
{
  "status": "ok",
  "subreddit": "demodemo",
  "posts_ingested": 3,
  "comments_ingested": 13,
  "source": "mock"
}
```

Notes:
- `source: "mock"` indicates Reddit credentials were not configured
- Repeat requests skip duplicate posts (idempotent)

---

## Step 3: List Subreddits

```bash
curl http://127.0.0.1:8000/subreddits
```

Returns all tracked subreddits with metadata (id, name, created_at, last_ingested_at).

---

## Step 4: Get Signal Snapshot

```bash
curl http://127.0.0.1:8000/signals/demodemo
```

**Expected:** Six operational signals with explanations.

**Actual (selected fields):**
```json
{
  "subreddit": "demodemo",
  "snapshot": {
    "activity_velocity": 51.0,
    "sentiment_drift": 0.8571,
    "keyword_acceleration": 0.3611,
    "hostility_score": 0.0,
    "controversy_density": 0.0,
    "anomaly_score": 0.3,
    "summary_json": "{...}"
  },
  "anomalies": [
    {
      "anomaly_type": "activity_surge",
      "severity": "medium",
      "explanation": "Anomaly score=0.3. Contributing factors: high activity velocity"
    }
  ]
}
```

Every signal includes an explanation. No black-box claims.

---

## Step 5: View Posts

```bash
curl http://127.0.0.1:8000/subreddits/demodemo/posts
```

Returns stored posts with title, score, num_comments, author_hash, permalink.

---

## Step 6: Get Replay Timeline

```bash
curl http://127.0.0.1:8000/replay/demodemo
```

Returns replay frames with activity_count, avg_score, hostility_score, keyword_summary, anomaly_count.

---

## Step 7: Devvit Capabilities

```bash
curl http://127.0.0.1:8000/devvit/capabilities
```

**Expected:** Available actions, limitations, safety boundaries.

**Actual:**
```json
{
  "available_actions": ["analyze_thread", "replay_thread", "thread_heatmap", "volatility_check"],
  "current_limitations": [
    "Mock data only when Reddit credentials are not configured",
    "No real-time streaming — data must be ingested first",
    "SQLite storage — not optimized for high throughput",
    "v0.1 signal engine — lexicon-based sentiment, no NLP"
  ],
  "safety_boundaries": [
    "No automated moderation actions are taken",
    "No individual user profiling or diagnosis",
    "No truth detection or disinformation labeling",
    "All signals include explanation fields for transparency",
    "All analysis is aggregate — subreddit level only"
  ],
  "automated_actions_enabled": false,
  "automated_action_taken": false
}
```

---

## Step 8: Devvit Analyze Thread

```bash
curl -X POST http://127.0.0.1:8000/devvit/analyze-thread \
  -H "Content-Type: application/json" \
  -d '{"subreddit": "demodemo"}'
```

Returns signal summary with explanations and recommended_moderator_view.

---

## Step 9: Devvit Volatility Check

```bash
curl -X POST http://127.0.0.1:8000/devvit/volatility-check \
  -H "Content-Type: application/json" \
  -d '{"subreddit": "demodemo"}'
```

**Actual:**
```json
{
  "status": "ok",
  "volatility_score": 0.2778,
  "contributing_factors": ["High activity velocity (51.0/hr)"],
  "explanation": "Volatility=0.2778. Factors: High activity velocity (51.0/hr).",
  "automated_action_taken": false
}
```

---

## Step 10: Dashboard (Frontend)

Open `http://localhost:5173` in a browser.

1. Enter a subreddit name in the input field
2. Click "Ingest" or press Enter
3. Select the subreddit from the pill buttons
4. View signal cards (6 metrics with values and explanations)
5. Activity chart (replay timeline)
6. Anomaly feed (detected anomalies with severity)
7. Recent posts table

---

## Step 11: Run Tests

```bash
cd apps/api
python -m pytest tests/ -v
```

**Result: 9 passed, 0 failed.**

---

## Step 12: Build Frontend

```bash
cd apps/frontend
npm run build
```

**Result:** Builds successfully. 648 modules transformed, assets generated.
