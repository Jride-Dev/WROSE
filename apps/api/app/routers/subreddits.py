from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..schemas import SubredditOut, PostOut

router = APIRouter()


@router.get("/subreddits", response_model=list[SubredditOut])
def list_subreddits(db: Session = Depends(get_db)):
    return db.query(models.Subreddit).all()


@router.get("/subreddits/{name}/posts", response_model=list[PostOut])
def list_posts(name: str, db: Session = Depends(get_db)):
    sub = db.query(models.Subreddit).filter(models.Subreddit.name == name).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subreddit not found")
    return db.query(models.Post).filter(models.Post.subreddit_id == sub.id).order_by(models.Post.created_utc.desc()).limit(50).all()
