import datetime
import json
import math
import random
from typing import Optional

from sqlalchemy.orm import Session
from . import models

POSITIVE_WORDS = {
    "good", "great", "excellent", "amazing", "love", "wonderful", "fantastic",
    "happy", "beautiful", "awesome", "best", "brilliant", "positive", "support",
    "helpful", "thanks", "thank", "agree", "insightful", "quality", "fun",
    "enjoy", "nice", "cool", "impressive", "wholesome", "based",
}

NEGATIVE_WORDS = {
    "bad", "terrible", "awful", "hate", "horrible", "worst", "ugly",
    "disgusting", "awful", "stupid", "idiot", "dumb", "trash", "garbage",
    "pathetic", "disaster", "sucks", "toxic", "disgrace", "fraud", "shame",
}

HOSTILE_WORDS = {
    "attack", "destroy", "kill", "die", "hate", "idiot", "moron", "stupid",
    "trash", "scum", "loser", "pathetic", "rage", "toxic", "abuse", "harass",
}


def compute_activity_velocity(db: Session, subreddit_id: int, window_hours: float = 1.0) -> tuple[float, str]:
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=window_hours)
    post_count = db.query(models.Post).filter(
        models.Post.subreddit_id == subreddit_id,
        models.Post.inserted_at >= cutoff,
    ).count()
    comment_count = db.query(models.Comment).join(models.Post).filter(
        models.Post.subreddit_id == subreddit_id,
        models.Comment.inserted_at >= cutoff,
    ).count()
    total = post_count + comment_count
    velocity = round(total / max(window_hours, 0.1), 2)
    explanation = f"{total} items in {window_hours}h window ({post_count} posts, {comment_count} comments); velocity={velocity}/hr"
    return velocity, explanation


def compute_sentiment_drift(db: Session, subreddit_id: int) -> tuple[float, str]:
    posts = db.query(models.Post).filter(
        models.Post.subreddit_id == subreddit_id
    ).order_by(models.Post.created_utc.desc()).limit(50).all()
    comments = db.query(models.Comment).join(models.Post).filter(
        models.Post.subreddit_id == subreddit_id
    ).order_by(models.Comment.created_utc.desc()).limit(100).all()

    total_pos = 0
    total_neg = 0
    texts = [p.title or "" for p in posts] + [c.body or "" for c in comments]

    if not texts:
        return 0.0, "No text data available for sentiment analysis."

    for text in texts:
        words = set(text.lower().split())
        total_pos += len(words & POSITIVE_WORDS)
        total_neg += len(words & NEGATIVE_WORDS)

    total = total_pos + total_neg
    if total == 0:
        return 0.0, "No sentiment-bearing words detected in recent content."

    drift = round((total_pos - total_neg) / total, 4)
    explanation = f"Sentiment drift={drift} (pos={total_pos}, neg={total_neg}, total_signals={total})"
    return drift, explanation


def compute_keyword_acceleration(db: Session, subreddit_id: int) -> tuple[float, str]:
    recent = db.query(models.Post).filter(
        models.Post.subreddit_id == subreddit_id
    ).order_by(models.Post.created_utc.desc()).limit(100).all()

    if len(recent) < 10:
        return 0.0, "Insufficient posts for keyword acceleration analysis."

    mid = len(recent) // 2
    older = recent[mid:]
    newer = recent[:mid]

    def word_freq(posts):
        freq = {}
        for p in posts:
            for w in (p.title or "").lower().split():
                if len(w) > 3:
                    freq[w] = freq.get(w, 0) + 1
        return freq

    old_freq = word_freq(older)
    new_freq = word_freq(newer)

    common = set(old_freq.keys()) & set(new_freq.keys())
    if not common:
        return 0.0, "No overlapping keywords between older and newer posts."

    acceleration = 0.0
    count = 0
    for word in common:
        old_count = old_freq[word]
        new_count = new_freq[word]
        if old_count > 0:
            ratio = (new_count - old_count) / old_count
            acceleration += ratio
            count += 1

    avg_accel = round(acceleration / count, 4) if count else 0.0
    top_words = sorted(common, key=lambda w: new_freq[w] / max(old_freq[w], 1), reverse=True)[:5]
    explanation = f"Keyword acceleration={avg_accel} across {count} shared keywords. Top risers: {top_words}"
    return avg_accel, explanation


def compute_hostility_score(db: Session, subreddit_id: int) -> tuple[float, str]:
    comments = db.query(models.Comment).join(models.Post).filter(
        models.Post.subreddit_id == subreddit_id
    ).order_by(models.Comment.created_utc.desc()).limit(200).all()

    if not comments:
        return 0.0, "No comments available for hostility analysis."

    hostile_count = 0
    for c in comments:
        words = set((c.body or "").lower().split())
        if words & HOSTILE_WORDS:
            hostile_count += 1

    ratio = round(hostile_count / len(comments), 4)
    explanation = f"Hostility score={ratio} ({hostile_count}/{len(comments)} comments contain hostile language)"
    return ratio, explanation


def compute_controversy_density(db: Session, subreddit_id: int) -> tuple[float, str]:
    posts = db.query(models.Post).filter(
        models.Post.subreddit_id == subreddit_id
    ).order_by(models.Post.created_utc.desc()).limit(50).all()

    if not posts:
        return 0.0, "No posts available for controversy analysis."

    controversy_count = 0
    for p in posts:
        if p.num_comments and p.num_comments > 5 and (p.score is None or p.score < 5):
            controversy_count += 1

    ratio = round(controversy_count / len(posts), 4)
    explanation = f"Controversy density={ratio} ({controversy_count}/{len(posts)} posts with high comments + low score)"
    return ratio, explanation


def compute_anomaly_score(
    activity_velocity: float,
    hostility_score: float,
    keyword_acceleration: float,
) -> tuple[float, str]:
    components = []
    reasons = []

    if activity_velocity > 50:
        components.append(0.3)
        reasons.append("high activity velocity")
    if hostility_score > 0.15:
        components.append(0.35)
        reasons.append("elevated hostility")
    if keyword_acceleration > 0.5:
        components.append(0.35)
        reasons.append("keyword acceleration spike")

    score = round(sum(components), 4) if components else 0.0
    if not reasons:
        explanation = "No anomaly indicators detected across all signals."
    else:
        explanation = f"Anomaly score={score}. Contributing factors: {', '.join(reasons)}"
    return score, explanation


def compute_signals(db: Session, subreddit_id: int) -> dict:
    velocity, vel_exp = compute_activity_velocity(db, subreddit_id)
    sentiment, sent_exp = compute_sentiment_drift(db, subreddit_id)
    kw_accel, kw_exp = compute_keyword_acceleration(db, subreddit_id)
    hostility, host_exp = compute_hostility_score(db, subreddit_id)
    controversy, cont_exp = compute_controversy_density(db, subreddit_id)
    anomaly, anom_exp = compute_anomaly_score(velocity, hostility, kw_accel)

    summary = {
        "activity_velocity": {"value": velocity, "explanation": vel_exp},
        "sentiment_drift": {"value": sentiment, "explanation": sent_exp},
        "keyword_acceleration": {"value": kw_accel, "explanation": kw_exp},
        "hostility_score": {"value": hostility, "explanation": host_exp},
        "controversy_density": {"value": controversy, "explanation": cont_exp},
        "anomaly_score": {"value": anomaly, "explanation": anom_exp},
    }

    return {
        "activity_velocity": velocity,
        "sentiment_drift": sentiment,
        "keyword_acceleration": kw_accel,
        "hostility_score": hostility,
        "controversy_density": controversy,
        "anomaly_score": anomaly,
        "summary_json": json.dumps(summary),
    }
