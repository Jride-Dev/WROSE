import datetime
import json
import random
import time

from sqlalchemy.orm import Session
from . import models
from .database import settings


def _mock_reddit_data(subreddit_name: str) -> list[dict]:
    now = time.time()
    posts = []
    for i in range(random.randint(3, 8)):
        post_id = f"mock_{subreddit_name}_{int(now)}_{i}"
        post = {
            "reddit_id": post_id,
            "title": random.choice([
                f"Discussion about {subreddit_name} trends",
                f"What is happening in {subreddit_name}?",
                f"Important update for {subreddit_name} community",
                f"Question about recent {subreddit_name} events",
                f"Analysis: {subreddit_name} activity patterns",
                f"Megathread: {subreddit_name} discussion",
                f"PSA regarding {subreddit_name}",
                f"Meta: improving {subreddit_name}",
            ]),
            "author_hash": f"user_{random.randint(1000, 9999)}",
            "score": random.randint(-5, 50),
            "num_comments": random.randint(0, 30),
            "created_utc": now - random.uniform(0, 86400),
            "permalink": f"/r/{subreddit_name}/comments/{post_id}/",
        }
        posts.append(post)
    return posts


def _mock_reddit_comments(post_reddit_id: str) -> list[dict]:
    now = time.time()
    comments = []
    for i in range(random.randint(0, 8)):
        comment_id = f"{post_reddit_id}_comment_{i}"
        comment = {
            "reddit_id": comment_id,
            "body": random.choice([
                "This is interesting content to review.",
                "I think this deserves more attention.",
                "The data here seems unusual.",
                "Great point, I agree with this analysis.",
                "This is completely wrong and misleading.",
                "Why is nobody talking about this?",
                "Mods should look into this activity.",
                "I've been watching this trend for weeks.",
                "This feels like coordinated activity.",
                "Just another normal post here.",
                "Can we get more transparency on this?",
                "Terrible take, downvoted.",
                "Thanks for sharing this information.",
                "This sub has gone downhill lately.",
                "Based and well-reasoned take.",
            ]),
            "author_hash": f"user_{random.randint(1000, 9999)}",
            "score": random.randint(-3, 20),
            "created_utc": now - random.uniform(0, 43200),
        }
        comments.append(comment)
    return comments


def _fetch_reddit_posts(subreddit_name: str) -> list[dict]:
    try:
        import praw
        reddit = praw.Reddit(
            client_id=settings.reddit_client_id,
            client_secret=settings.reddit_client_secret,
            user_agent=settings.reddit_user_agent,
        )
        sub = reddit.subreddit(subreddit_name)
        posts = []
        for submission in sub.hot(limit=25):
            posts.append({
                "reddit_id": submission.id,
                "title": submission.title,
                "author_hash": str(submission.author) if submission.author else "deleted",
                "score": submission.score,
                "num_comments": submission.num_comments,
                "created_utc": submission.created_utc,
                "permalink": submission.permalink,
            })
        return posts
    except Exception:
        return []


def _fetch_reddit_comments(post_id: str, subreddit_name: str) -> list[dict]:
    try:
        import praw
        reddit = praw.Reddit(
            client_id=settings.reddit_client_id,
            client_secret=settings.reddit_client_secret,
            user_agent=settings.reddit_user_agent,
        )
        submission = reddit.submission(id=post_id)
        submission.comments.replace_more(limit=0)
        comments = []
        for comment in submission.comments.list():
            comments.append({
                "reddit_id": comment.id,
                "body": comment.body,
                "author_hash": str(comment.author) if comment.author else "deleted",
                "score": comment.score,
                "created_utc": comment.created_utc,
            })
        return comments
    except Exception:
        return []


def ingest_subreddit(db: Session, subreddit_name: str) -> dict:
    sub = db.query(models.Subreddit).filter(models.Subreddit.name == subreddit_name).first()
    if not sub:
        sub = models.Subreddit(name=subreddit_name, display_name=subreddit_name)
        db.add(sub)
        db.commit()
        db.refresh(sub)

    has_credentials = bool(settings.reddit_client_id and settings.reddit_client_secret)
    source = "reddit" if has_credentials else "mock"

    if has_credentials:
        raw_posts = _fetch_reddit_posts(subreddit_name)
    else:
        raw_posts = _mock_reddit_data(subreddit_name)

    posts_ingested = 0
    comments_ingested = 0

    for raw_post in raw_posts:
        existing = db.query(models.Post).filter(
            models.Post.reddit_id == raw_post["reddit_id"]
        ).first()
        if existing:
            continue

        post = models.Post(
            reddit_id=raw_post["reddit_id"],
            subreddit_id=sub.id,
            title=raw_post.get("title"),
            author_hash=raw_post.get("author_hash"),
            score=raw_post.get("score", 0),
            num_comments=raw_post.get("num_comments", 0),
            created_utc=raw_post.get("created_utc"),
            permalink=raw_post.get("permalink"),
            raw_json=json.dumps(raw_post),
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        posts_ingested += 1

        if has_credentials:
            raw_comments = _fetch_reddit_comments(raw_post["reddit_id"], subreddit_name)
        else:
            raw_comments = _mock_reddit_comments(raw_post["reddit_id"])

        for raw_comment in raw_comments:
            existing_c = db.query(models.Comment).filter(
                models.Comment.reddit_id == raw_comment["reddit_id"]
            ).first()
            if existing_c:
                continue

            comment = models.Comment(
                reddit_id=raw_comment["reddit_id"],
                post_id=post.id,
                author_hash=raw_comment.get("author_hash"),
                body=raw_comment.get("body"),
                score=raw_comment.get("score", 0),
                created_utc=raw_comment.get("created_utc"),
                raw_json=json.dumps(raw_comment),
            )
            db.add(comment)
            comments_ingested += 1

        db.commit()

    sub.last_ingested_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "status": "ok",
        "subreddit": subreddit_name,
        "posts_ingested": posts_ingested,
        "comments_ingested": comments_ingested,
        "source": source,
    }
