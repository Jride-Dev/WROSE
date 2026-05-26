import datetime
import json
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..schemas import ReplayResponse, ReplayFrameOut

router = APIRouter()


@router.get("/replay/{subreddit}", response_model=ReplayResponse)
def get_replay(subreddit: str, db: Session = Depends(get_db)):
    sub = db.query(models.Subreddit).filter(models.Subreddit.name == subreddit).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subreddit not found")

    existing = db.query(models.ReplayFrame).filter(
        models.ReplayFrame.subreddit_id == sub.id
    ).order_by(models.ReplayFrame.frame_index).all()

    if existing:
        return ReplayResponse(
            subreddit=subreddit,
            frames=[ReplayFrameOut.model_validate(f) for f in existing],
        )

    posts = db.query(models.Post).filter(
        models.Post.subreddit_id == sub.id
    ).order_by(models.Post.created_utc).all()

    if not posts:
        return ReplayResponse(subreddit=subreddit, frames=[])

    frame_count = min(len(posts), 10)
    chunk_size = max(len(posts) // frame_count, 1)
    frames = []

    for i in range(frame_count):
        chunk = posts[i * chunk_size : (i + 1) * chunk_size]
        if not chunk:
            break
        avg_score = sum(p.score or 0 for p in chunk) / len(chunk)
        activity_count = len(chunk)
        hostility = round(random.uniform(0, 0.3), 4)
        keywords = {}
        for p in chunk:
            if p.title:
                for w in p.title.lower().split():
                    if len(w) > 3:
                        keywords[w] = keywords.get(w, 0) + 1
        top_kw = dict(sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:5])

        frame = models.ReplayFrame(
            subreddit_id=sub.id,
            frame_time=datetime.datetime.utcnow(),
            frame_index=i,
            activity_count=activity_count,
            avg_score=round(avg_score, 2),
            hostility_score=hostility,
            keyword_summary_json=json.dumps(top_kw),
            anomaly_count=random.randint(0, 2),
        )
        db.add(frame)
        frames.append(frame)

    db.commit()

    return ReplayResponse(
        subreddit=subreddit,
        frames=[ReplayFrameOut.model_validate(f) for f in frames],
    )
