from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ..core.config import settings
import urllib.parse

# PostgreSQL connection
connect_args = {}

# Increase pool size and add proper connection management
engine = create_engine(
    settings.database_url, 
    echo=False,  # Disable echo to reduce noise
    connect_args=connect_args,
    pool_size=10,  # Increase from default 5
    max_overflow=20,  # Increase from default 10
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
