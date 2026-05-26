from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base, SessionLocal
from app.models import Subreddit
from app.ingestion import ingest_subreddit

client = TestClient(app)


def setup_module(module):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        sub = db.query(Subreddit).filter(Subreddit.name == "testdevvit").first()
        if not sub:
            ingest_subreddit(db, "testdevvit")
    finally:
        db.close()


def test_capabilities():
    res = client.get("/devvit/capabilities")
    assert res.status_code == 200
    data = res.json()
    assert "available_actions" in data
    assert data["automated_actions_enabled"] is False
    assert data["automated_action_taken"] is False
    assert "analyze_thread" in data["available_actions"]


def test_analyze_thread_no_data():
    res = client.post("/devvit/analyze-thread", json={
        "subreddit": "nonexistent_sub",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "no_data"
    assert data["automated_action_taken"] is False


def test_analyze_thread_with_data():
    res = client.post("/devvit/analyze-thread", json={
        "subreddit": "testdevvit",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["automated_action_taken"] is False
    assert "signals" in data
    assert "explanations" in data
    assert "recommended_moderator_view" in data


def test_replay_thread_no_data():
    res = client.post("/devvit/replay-thread", json={
        "subreddit": "nonexistent_sub",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "no_data"
    assert data["automated_action_taken"] is False


def test_replay_thread_with_data():
    res = client.post("/devvit/replay-thread", json={
        "subreddit": "testdevvit",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["automated_action_taken"] is False
    assert "replay_frames" in data
    assert "summary" in data


def test_thread_heatmap_no_data():
    res = client.post("/devvit/thread-heatmap", json={
        "subreddit": "nonexistent_sub",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "no_data"
    assert data["automated_action_taken"] is False


def test_thread_heatmap_with_data():
    res = client.post("/devvit/thread-heatmap", json={
        "subreddit": "testdevvit",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["automated_action_taken"] is False
    assert "heatmap_points" in data
    assert "signal_intensity_summary" in data


def test_volatility_check_no_data():
    res = client.post("/devvit/volatility-check", json={
        "subreddit": "nonexistent_sub",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "no_data"
    assert data["automated_action_taken"] is False


def test_volatility_check_with_data():
    res = client.post("/devvit/volatility-check", json={
        "subreddit": "testdevvit",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["automated_action_taken"] is False
    assert "volatility_score" in data
    assert "contributing_factors" in data
    assert "explanation" in data
