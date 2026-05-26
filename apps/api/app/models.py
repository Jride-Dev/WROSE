import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Subreddit(Base):
    __tablename__ = "subreddits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    display_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_ingested_at = Column(DateTime, nullable=True)

    posts = relationship("Post", back_populates="subreddit")
    signal_snapshots = relationship("SignalSnapshot", back_populates="subreddit")
    anomalies = relationship("Anomaly", back_populates="subreddit")
    replay_frames = relationship("ReplayFrame", back_populates="subreddit")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    reddit_id = Column(String, unique=True, nullable=False)
    subreddit_id = Column(Integer, ForeignKey("subreddits.id"), nullable=False)
    title = Column(String)
    author_hash = Column(String)
    score = Column(Integer, default=0)
    num_comments = Column(Integer, default=0)
    created_utc = Column(Float)
    permalink = Column(String)
    raw_json = Column(Text)
    inserted_at = Column(DateTime, default=datetime.datetime.utcnow)

    subreddit = relationship("Subreddit", back_populates="posts")
    comments = relationship("Comment", back_populates="post")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    reddit_id = Column(String, unique=True, nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    author_hash = Column(String)
    body = Column(Text)
    score = Column(Integer, default=0)
    created_utc = Column(Float)
    raw_json = Column(Text)
    inserted_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("Post", back_populates="comments")


class SignalSnapshot(Base):
    __tablename__ = "signal_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    subreddit_id = Column(Integer, ForeignKey("subreddits.id"), nullable=False)
    snapshot_time = Column(DateTime, default=datetime.datetime.utcnow)
    activity_velocity = Column(Float, default=0.0)
    sentiment_drift = Column(Float, default=0.0)
    keyword_acceleration = Column(Float, default=0.0)
    hostility_score = Column(Float, default=0.0)
    controversy_density = Column(Float, default=0.0)
    anomaly_score = Column(Float, default=0.0)
    summary_json = Column(Text)

    subreddit = relationship("Subreddit", back_populates="signal_snapshots")


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    subreddit_id = Column(Integer, ForeignKey("subreddits.id"), nullable=False)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    anomaly_type = Column(String)
    severity = Column(String)
    explanation = Column(Text)
    related_post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    metadata_json = Column(Text)

    subreddit = relationship("Subreddit", back_populates="anomalies")


class ReplayFrame(Base):
    __tablename__ = "replay_frames"

    id = Column(Integer, primary_key=True, index=True)
    subreddit_id = Column(Integer, ForeignKey("subreddits.id"), nullable=False)
    frame_time = Column(DateTime, default=datetime.datetime.utcnow)
    frame_index = Column(Integer, default=0)
    activity_count = Column(Integer, default=0)
    avg_score = Column(Float, default=0.0)
    hostility_score = Column(Float, default=0.0)
    keyword_summary_json = Column(Text)
    anomaly_count = Column(Integer, default=0)

    subreddit = relationship("Subreddit", back_populates="replay_frames")
