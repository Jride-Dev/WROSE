import datetime
from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    status: str
    database: str


class SubredditOut(BaseModel):
    id: int
    name: str
    display_name: Optional[str] = None
    created_at: datetime.datetime
    last_ingested_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class PostOut(BaseModel):
    id: int
    reddit_id: str
    subreddit_id: int
    title: Optional[str] = None
    author_hash: Optional[str] = None
    score: int = 0
    num_comments: int = 0
    created_utc: Optional[float] = None
    permalink: Optional[str] = None
    inserted_at: datetime.datetime

    model_config = {"from_attributes": True}


class SignalSnapshotOut(BaseModel):
    id: int
    subreddit_id: int
    snapshot_time: datetime.datetime
    activity_velocity: float
    sentiment_drift: float
    keyword_acceleration: float
    hostility_score: float
    controversy_density: float
    anomaly_score: float
    summary_json: Optional[str] = None

    model_config = {"from_attributes": True}


class AnomalyOut(BaseModel):
    id: int
    subreddit_id: int
    detected_at: datetime.datetime
    anomaly_type: str
    severity: str
    explanation: str
    related_post_id: Optional[int] = None
    metadata_json: Optional[str] = None

    model_config = {"from_attributes": True}


class ReplayFrameOut(BaseModel):
    id: int
    subreddit_id: int
    frame_time: datetime.datetime
    frame_index: int
    activity_count: int
    avg_score: float
    hostility_score: float
    keyword_summary_json: Optional[str] = None
    anomaly_count: int

    model_config = {"from_attributes": True}


class IngestResponse(BaseModel):
    status: str
    subreddit: str
    posts_ingested: int
    comments_ingested: int
    source: str


class SignalResponse(BaseModel):
    subreddit: str
    snapshot: SignalSnapshotOut
    anomalies: list[AnomalyOut]


class ReplayResponse(BaseModel):
    subreddit: str
    frames: list[ReplayFrameOut]
