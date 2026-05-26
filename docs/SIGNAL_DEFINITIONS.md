# WROSE Signal Definitions — v0.1

All signals are computed from stored posts and comments for a single subreddit. Every value includes an accompanying explanation field.

## activity_velocity

**What it measures:** Rate of new content in the subreddit.

**Calculation (v0.1):**
- Count posts and comments inserted within the last hour
- Divide by the window size (1 hour)
- Result: items per hour

**Interpretation:**
- Low (<10): quiet subreddit
- Medium (10–50): normal activity
- High (50+): high-velocity activity

## sentiment_drift

**What it measures:** Net positive/negative tone in recent content.

**Calculation (v0.1):**
- Scan last 50 posts (titles) and last 100 comments (body text)
- Count occurrences of words from a curated positive word list (good, great, love, etc.)
- Count occurrences from a negative word list (bad, terrible, hate, etc.)
- Score = (pos_count - neg_count) / (pos_count + neg_count)
- Result: -1.0 (very negative) to +1.0 (very positive)

**Limitations:** Simple lexicon lookup; no negation handling, no context awareness.

## keyword_acceleration

**What it measures:** Whether specific keywords are appearing more frequently in recent posts vs. older posts.

**Calculation (v0.1):**
- Take the last 100 posts; split into newer half (most recent 50) and older half (previous 50)
- Build word frequency tables for each half (words > 3 characters)
- For each keyword appearing in both halves, compute frequency ratio: (new_count - old_count) / old_count
- Average all ratios to produce the acceleration score
- Positive value = keywords accelerating; negative = decelerating

**Interpretation:**
- Near 0: stable keyword usage
- > 0.3: notable keyword acceleration
- > 0.5: significant acceleration (potential coordinated activity)

## hostility_score

**What it measures:** Proportion of comments containing hostile language.

**Calculation (v0.1):**
- Scan last 200 comments
- Count comments containing any word from the hostile word list (attack, kill, idiot, etc.)
- Score = hostile_comment_count / total_comment_count
- Result: 0.0 to 1.0

**Interpretation:**
- < 0.05: low hostility
- 0.05–0.15: moderate hostility
- > 0.15: elevated hostility

## controversy_density

**What it measures:** Proportion of posts with high-comment count but low score (engagement without approval).

**Calculation (v0.1):**
- Scan last 50 posts
- Count posts with > 5 comments AND score < 5
- Score = controversial_post_count / total_post_count
- Result: 0.0 to 1.0

**Interpretation:**
- < 0.1: low controversy
- 0.1–0.3: moderate controversy
- > 0.3: elevated controversy

## anomaly_score

**What it measures:** Composite indicator that something unusual may be happening.

**Calculation (v0.1):**
- Combine three weighted sub-signals:
  - Activity velocity > 50: +0.3
  - Hostility score > 0.15: +0.35
  - Keyword acceleration > 0.5: +0.35
- Result: 0.0 to 1.0

**Interpretation:**
- 0.0: no anomaly indicators
- 0.1–0.3: minor signals worth monitoring
- 0.3–0.6: moderate anomaly
- > 0.6: significant anomaly requiring attention

## Important

These are v0.1 placeholder implementations. All scores are approximate and aggregate only. No individual user is ever targeted or diagnosed. All scores include an explanation field for transparency.
