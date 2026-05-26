# WROSE Phase 1 Screenshots

This document captures text representations of key Phase 1 outputs. In a production demo, replace these with actual screenshots.

---

## Screenshot 1: Health Check

```
GET http://127.0.0.1:8000/health
────────────────────────────────────────────────

Status: 200 OK

┌─────────────────────────────┐
│  status: "ok"               │
│  database: "ok"             │
│                             │
│  [●] API: ok                │
│  [●] Database: ok           │
└─────────────────────────────┘
```

---

## Screenshot 2: Mock Ingestion

```
POST http://127.0.0.1:8000/ingest/subreddit/demodemo
─────────────────────────────────────────────────────

Status: 200 OK
┌─────────────────────────────────────────────┐
│  WROSE Ingestion                             │
│                                              │
│  Subreddit:  demodemo                        │
│  Source:     mock                            │
│  Posts:      3                               │
│  Comments:   13                              │
│                                              │
│  No Reddit credentials configured.           │
│  Using deterministic mock data.              │
└─────────────────────────────────────────────┘
```

---

## Screenshot 3: Dashboard (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│  WROSE                                          [●] API: connected │
│  Working Reddit Operational Signal Engine                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ [Input: demodemo...........] [Ingest]                        │   │
│  │                            _                                 │   │
│  │  [demodemo] [testsub] [testdevvit] [phase1b]                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Activity    │  │ Sentiment   │  │ Keyword     │                │
│  │ Velocity    │  │ Drift       │  │ Acceleration│                │
│  │             │  │             │  │             │                │
│  │   51.0      │  │   0.8571    │  │   0.3611    │                │
│  │             │  │             │  │             │                │
│  │ 51 items in │  │ pos=13,     │  │ 9 shared    │                │
│  │ 1.0h window │  │ neg=1       │  │ keywords    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Hostility   │  │ Controversy │  │ Anomaly     │                │
│  │ Score       │  │ Density     │  │ Score       │                │
│  │             │  │             │  │             │                │
│  │   0.0       │  │   0.0       │  │   0.3       │                │
│  │             │  │             │  │             │                │
│  │ 0/41        │  │ 0/10 posts  │  │ high        │                │
│  │ comments    │  │             │  │ activity    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────────────────────────┐ ┌──────────────────────────┐  │
│  │ Activity (Replay Timeline)      │ │ Anomaly Feed             │  │
│  │                                 │ │                          │  │
│  │  10 |    ··                     │ │ [activity_surge] high    │  │
│  │   8 |   ·· ··                   │ │   activity detected      │  │
│  │   6 |   ·· ··                   │ │                          │  │
│  │   4 |   ······                  │ │                          │  │
│  │   2 |   ······                  │ │                          │  │
│  │   0 ──────────────────          │ │                          │  │
│  │      0  1  2  3  4  5          │ │                          │  │
│  │  ── activity ── hostility       │ │                          │  │
│  └─────────────────────────────────┘ └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Recent Posts                                                  │   │
│  │                                                               │   │
│  │ Title                    │ Score │ Comments │ Author          │   │
│  │ ─────────────────────────┼───────┼──────────┼──────────────── │   │
│  │ What is happening in...  │  35   │   23     │ user_4363       │   │
│  │ Meta: improving demodemo │  14   │    2     │ user_7977       │   │
│  │ Discussion about demo... │   1   │   22     │ user_3545       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screenshot 4: Signals API Response

```
GET http://127.0.0.1:8000/signals/demodemo
────────────────────────────────────────────

{
  "subreddit": "demodemo",
  "snapshot": {
    "activity_velocity": 51.0,
    "sentiment_drift": 0.8571,
    "keyword_acceleration": 0.3611,
    "hostility_score": 0.0,
    "controversy_density": 0.0,
    "anomaly_score": 0.3
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

---

## Screenshot 5: Replay Timeline

```
GET http://127.0.0.1:8000/replay/demodemo
───────────────────────────────────────────

Replay Frames (7 total):

 Frame │ Posts │ Avg Score │ Hostility │ Anomalies
───────┼───────┼───────────┼───────────┼──────────
   0   │   1   │   35.0    │   0.156   │    0
   1   │   1   │   14.0    │   0.063   │    1
   2   │   1   │    1.0    │   0.117   │    0
   3   │   1   │   44.0    │   0.276   │    1
   4   │   1   │    2.0    │   0.073   │    2
   5   │   1   │   46.0    │   0.260   │    1
   6   │   1   │   13.0    │   0.027   │    2
```

---

## Screenshot 6: Devvit Capabilities

```
GET http://127.0.0.1:8000/devvit/capabilities
───────────────────────────────────────────────

┌──────────────────────────────────────────────────┐
│  WROSE Sentinel — Devvit Capabilities            │
├──────────────────────────────────────────────────┤
│                                                   │
│  Available Actions:                               │
│    ✓ analyze_thread                               │
│    ✓ replay_thread                                │
│    ✓ thread_heatmap                               │
│    ✓ volatility_check                             │
│                                                   │
│  Current Limitations:                             │
│    • Mock data only when credentials missing      │
│    • No real-time streaming                       │
│    • SQLite — not high-throughput                 │
│    • v0.1 lexicon-based sentiment                 │
│                                                   │
│  Safety Boundaries:                               │
│    • No automated moderation actions              │
│    • No individual user profiling                 │
│    • All signals include explanations             │
│    • Aggregate — subreddit level only             │
│                                                   │
│  Automated Actions: DISABLED                      │
│  automated_action_taken: false                    │
└──────────────────────────────────────────────────┘
```

---

## Screenshot 7: Test Output

```
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.0.3, pluggy-1.6.0
rootdir: F:\WROSE\apps\api
collected 9 items

tests/test_devvit.py::test_capabilities PASSED                           [ 11%]
tests/test_devvit.py::test_analyze_thread_no_data PASSED                 [ 22%]
tests/test_devvit.py::test_analyze_thread_with_data PASSED               [ 33%]
tests/test_devvit.py::test_replay_thread_no_data PASSED                  [ 44%]
tests/test_devvit.py::test_replay_thread_with_data PASSED                [ 55%]
tests/test_devvit.py::test_thread_heatmap_no_data PASSED                 [ 66%]
tests/test_devvit.py::test_thread_heatmap_with_data PASSED               [ 77%]
tests/test_devvit.py::test_volatility_check_no_data PASSED               [ 88%]
tests/test_devvit.py::test_volatility_check_with_data PASSED             [100%]

========================= 9 passed, 5 warnings in 0.73s =======================
```

---

## Screenshot 8: Frontend Build Output

```
> wrose-frontend@0.1.0 build
> vite build

vite v6.4.2 building for production...
✓ 648 modules transformed.
rendering chunks...
computing gzip size...

dist/index.html                  0.45 kB │ gzip:   0.31 kB
dist/assets/index-CA9CUFwB.css  9.45 kB │ gzip:   2.60 kB
dist/assets/index-yG2-5ZzQ.js 547.13 kB │ gzip: 157.48 kB

✓ built in 2.55s
```

---

## Screenshot 9: Database Schema

```
SQLite: F:\WROSE\sql\wrose.db

Tables:
  subreddits       │ id, name, display_name, created_at, last_ingested_at
  posts            │ id, reddit_id, subreddit_id, title, author_hash,
                   │ score, num_comments, created_utc, permalink, raw_json,
                   │ inserted_at
  comments         │ id, reddit_id, post_id, author_hash, body, score,
                   │ created_utc, raw_json, inserted_at
  signal_snapshots │ id, subreddit_id, snapshot_time, activity_velocity,
                   │ sentiment_drift, keyword_acceleration, hostility_score,
                   │ controversy_density, anomaly_score, summary_json
  anomalies        │ id, subreddit_id, detected_at, anomaly_type, severity,
                   │ explanation, related_post_id, metadata_json
  replay_frames    │ id, subreddit_id, frame_time, frame_index,
                   │ activity_count, avg_score, hostility_score,
                   │ keyword_summary_json, anomaly_count
```

---

## Screenshot 10: Git Log

```
$ git log --oneline

b147928 Add Devvit readiness layer for WROSE Phase 1B
4a247de chore: cleanup gitignore, remove logs and obsidian vault
1581edc Phase 1: Initial WROSE prototype
```
