from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///../../sql/wrose.db"
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "WROSE/0.1"
    api_host: str = "127.0.0.1"
    api_port: int = 8000

    model_config = {"env_file": "../../.env", "extra": "ignore"}


settings = Settings()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
