import datetime
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..signal_engine import compute_signals
from ..schemas import SignalResponse, SignalSnapshotOut, AnomalyOut

router = APIRouter()


@router.get("/signals/{subreddit}", response_model=SignalResponse)
def get_signals(subreddit: str, db: Session = Depends(get_db)):
    sub = db.query(models.Subreddit).filter(models.Subreddit.name == subreddit).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subreddit not found")

    signals = compute_signals(db, sub.id)

    snapshot = models.SignalSnapshot(
        subreddit_id=sub.id,
        snapshot_time=datetime.datetime.utcnow(),
        **{k: signals[k] for k in [
            "activity_velocity", "sentiment_drift", "keyword_acceleration",
            "hostility_score", "controversy_density", "anomaly_score",
        ]},
        summary_json=signals["summary_json"],
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    summary = json.loads(signals["summary_json"])
    for signal_name, data in summary.items():
        if data["value"] != 0:
            anomaly_type = None
            severity = "low"
            if signal_name == "anomaly_score" and data["value"] > 0.3:
                anomaly_type = "anomaly_score"
                severity = "medium"
            elif signal_name == "hostility_score" and data["value"] > 0.15:
                anomaly_type = "hostility_spike"
                severity = "medium"
            elif signal_name == "keyword_acceleration" and data["value"] > 0.5:
                anomaly_type = "keyword_surge"
                severity = "low"
            elif signal_name == "activity_velocity" and data["value"] > 50:
                anomaly_type = "activity_surge"
                severity = "medium"

            if anomaly_type:
                anomaly = models.Anomaly(
                    subreddit_id=sub.id,
                    detected_at=datetime.datetime.utcnow(),
                    anomaly_type=anomaly_type,
                    severity=severity,
                    explanation=data["explanation"],
                )
                db.add(anomaly)

    db.commit()

    anomalies = db.query(models.Anomaly).filter(
        models.Anomaly.subreddit_id == sub.id
    ).order_by(models.Anomaly.detected_at.desc()).limit(10).all()

    return SignalResponse(
        subreddit=subreddit,
        snapshot=SignalSnapshotOut.model_validate(snapshot),
        anomalies=[AnomalyOut.model_validate(a) for a in anomalies],
    )
