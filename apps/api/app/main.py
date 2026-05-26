from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import health, subreddits, ingest, signals, replay, devvit

app = FastAPI(title="WROSE API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(subreddits.router)
app.include_router(ingest.router)
app.include_router(signals.router)
app.include_router(replay.router)
app.include_router(devvit.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
