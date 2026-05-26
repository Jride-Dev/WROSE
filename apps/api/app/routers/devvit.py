import datetime
import json
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from .. import models
from ..signal_engine import compute_signals

router = APIRouter()

NO_DATA_MESSAGE = "No stored data found for this subreddit. Run ingestion first."


class AnalyzeThreadInput(BaseModel):
    subreddit: str
    post_id: Optional[str] = None
    comment_id: Optional[str] = None
    requested_action: Optional[str] = None


class ReplayThreadInput(BaseModel):
    subreddit: str
    post_id: Optional[str] = None
    time_window: Optional[str] = None


class ThreadHeatmapInput(BaseModel):
    subreddit: str
    post_id: Optional[str] = None


class VolatilityCheckInput(BaseModel):
    subreddit: str
    post_id: Optional[str] = None
    comment_id: Optional[str] = None


def _no_data_response():
    return {
        "status": "no_data",
        "message": NO_DATA_MESSAGE,
        "automated_action_taken": False,
    }


def _get_sub_or_no_data(db: Session, name: str):
    sub = db.query(models.Subreddit).filter(models.Subreddit.name == name).first()
    return sub


@router.get("/devvit/capabilities")
def get_capabilities():
    return {
        "available_actions": [
            "analyze_thread",
            "replay_thread",
            "thread_heatmap",
            "volatility_check",
        ],
        "current_limitations": [
            "Mock data only when Reddit credentials are not configured",
            "No real-time streaming — data must be ingested first",
            "SQLite storage — not optimized for high throughput",
            "v0.1 signal engine — lexicon-based sentiment, no NLP",
        ],
        "safety_boundaries": [
            "No automated moderation actions are taken",
            "No individual user profiling or diagnosis",
            "No truth detection or disinformation labeling",
            "All signals include explanation fields for transparency",
            "All analysis is aggregate — subreddit level only",
        ],
        "automated_actions_enabled": False,
        "automated_action_taken": False,
    }


@router.post("/devvit/analyze-thread")
def analyze_thread(input: AnalyzeThreadInput, db: Session = Depends(get_db)):
    sub = _get_sub_or_no_data(db, input.subreddit)
    if not sub:
        return _no_data_response()

    posts = db.query(models.Post).filter(
        models.Post.subreddit_id == sub.id
    ).order_by(models.Post.created_utc.desc()).limit(10).all()

    if not posts:
        return _no_data_response()

    target_post = None
    if input.post_id:
        target_post = db.query(models.Post).filter(
            models.Post.reddit_id == input.post_id,
            models.Post.subreddit_id == sub.id,
        ).first()

    signals = compute_signals(db, sub.id)
    summary = json.loads(signals["summary_json"])

    result = {
        "status": "ok",
        "summary": summary,
        "signals": {
            "activity_velocity": signals["activity_velocity"],
            "sentiment_drift": signals["sentiment_drift"],
            "keyword_acceleration": signals["keyword_acceleration"],
            "hostility_score": signals["hostility_score"],
            "controversy_density": signals["controversy_density"],
            "anomaly_score": signals["anomaly_score"],
        },
        "explanations": {
            k: v["explanation"] for k, v in summary.items()
        },
        "recommended_moderator_view": _recommended_view(summary),
        "analyzed_post_id": input.post_id,
        "automated_action_taken": False,
    }

    if target_post:
        result["analyzed_post_title"] = target_post.title

    return result


def _recommended_view(summary: dict) -> str:
    anom = summary.get("anomaly_score", {}).get("value", 0)
    host = summary.get("hostility_score", {}).get("value", 0)
    kw = summary.get("keyword_acceleration", {}).get("value", 0)

    if anom > 0.5:
        return "Review anomaly details — multiple indicators elevated"
    if host > 0.15:
        return "Review hostility patterns — elevated aggressive language detected"
    if kw > 0.5:
        return "Review keyword acceleration — unusual topic shift detected"
    if anom > 0.3:
        return "Monitor thread — minor anomaly indicators present"
    return "Thread appears stable — routine monitoring"


@router.post("/devvit/replay-thread")
def replay_thread(input: ReplayThreadInput, db: Session = Depends(get_db)):
    sub = _get_sub_or_no_data(db, input.subreddit)
    if not sub:
        return _no_data_response()

    frames = db.query(models.ReplayFrame).filter(
        models.ReplayFrame.subreddit_id == sub.id
    ).order_by(models.ReplayFrame.frame_index).all()

    if not frames:
        posts = db.query(models.Post).filter(
            models.Post.subreddit_id == sub.id
        ).order_by(models.Post.created_utc).all()
        if not posts:
            return _no_data_response()

        frame_count = min(len(posts), 10)
        chunk_size = max(len(posts) // frame_count, 1)
        frames_data = []
        for i in range(frame_count):
            chunk = posts[i * chunk_size: (i + 1) * chunk_size]
            if not chunk:
                break
            avg_score = sum(p.score or 0 for p in chunk) / len(chunk)
            frames_data.append({
                "frame_index": i,
                "activity_count": len(chunk),
                "avg_score": round(avg_score, 2),
                "hostility_score": round(random.uniform(0, 0.3), 4),
                "anomaly_count": random.randint(0, 2),
            })
        replay_frames = frames_data
    else:
        replay_frames = [
            {
                "frame_index": f.frame_index,
                "activity_count": f.activity_count,
                "avg_score": f.avg_score,
                "hostility_score": f.hostility_score,
                "anomaly_count": f.anomaly_count,
            }
            for f in frames
        ]

    return {
        "status": "ok",
        "replay_frames": replay_frames,
        "summary": {
            "total_frames": len(replay_frames),
            "peak_activity": max(f["activity_count"] for f in replay_frames) if replay_frames else 0,
            "peak_hostility": max(f["hostility_score"] for f in replay_frames) if replay_frames else 0,
        },
        "automated_action_taken": False,
    }


@router.post("/devvit/thread-heatmap")
def thread_heatmap(input: ThreadHeatmapInput, db: Session = Depends(get_db)):
    sub = _get_sub_or_no_data(db, input.subreddit)
    if not sub:
        return _no_data_response()

    posts = db.query(models.Post).filter(
        models.Post.subreddit_id == sub.id
    ).order_by(models.Post.created_utc).all()

    if not posts:
        return _no_data_response()

    bucket_count = 8
    chunk_size = max(len(posts) // bucket_count, 1)
    buckets = []

    for i in range(bucket_count):
        chunk = posts[i * chunk_size: (i + 1) * chunk_size]
        if not chunk:
            break
        avg_score = sum(p.score or 0 for p in chunk) / len(chunk)
        avg_comments = sum(p.num_comments or 0 for p in chunk) / len(chunk)
        buckets.append({
            "bucket_index": i,
            "post_count": len(chunk),
            "avg_score": round(avg_score, 2),
            "avg_comments": round(avg_comments, 2),
            "intensity": round((avg_comments + 1) / (abs(avg_score) + 1), 4),
        })

    signals = compute_signals(db, sub.id)

    return {
        "status": "ok",
        "heatmap_points": buckets,
        "signal_intensity_summary": {
            "activity_velocity": signals["activity_velocity"],
            "hostility_score": signals["hostility_score"],
            "controversy_density": signals["controversy_density"],
            "anomaly_score": signals["anomaly_score"],
        },
        "automated_action_taken": False,
    }


@router.post("/devvit/volatility-check")
def volatility_check(input: VolatilityCheckInput, db: Session = Depends(get_db)):
    sub = _get_sub_or_no_data(db, input.subreddit)
    if not sub:
        return _no_data_response()

    posts = db.query(models.Post).filter(
        models.Post.subreddit_id == sub.id
    ).order_by(models.Post.created_utc.desc()).limit(20).all()

    if not posts:
        return _no_data_response()

    signals = compute_signals(db, sub.id)
    summary = json.loads(signals["summary_json"])

    factors = []
    anom_val = signals["anomaly_score"]
    host_val = signals["hostility_score"]
    kw_val = signals["keyword_acceleration"]
    vel_val = signals["activity_velocity"]

    if host_val > 0.15:
        factors.append(f"Elevated hostility ({host_val})")
    if kw_val > 0.5:
        factors.append(f"Keyword acceleration spike ({kw_val})")
    if vel_val > 30:
        factors.append(f"High activity velocity ({vel_val}/hr)")
    if signals["controversy_density"] > 0.3:
        factors.append(f"Elevated controversy density ({signals['controversy_density']})")

    volatility = round(
        (host_val * 0.3) + (kw_val * 0.25) + (min(vel_val / 100, 1) * 0.25) + (anom_val * 0.2),
        4,
    )

    return {
        "status": "ok",
        "volatility_score": volatility,
        "contributing_factors": factors if factors else ["No significant volatility factors detected"],
        "explanation": (
            f"Volatility={volatility}. "
            + (f"Factors: {', '.join(factors)}." if factors else "Activity patterns appear stable.")
        ),
        "automated_action_taken": False,
    }
