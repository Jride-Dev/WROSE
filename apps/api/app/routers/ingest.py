from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..ingestion import ingest_subreddit
from ..schemas import IngestResponse

router = APIRouter()


@router.post("/ingest/subreddit/{name}", response_model=IngestResponse)
def ingest(name: str, db: Session = Depends(get_db)):
    return ingest_subreddit(db, name)
