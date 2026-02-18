import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Get the backend directory (parent of app directory)
BACKEND_DIR = Path(__file__).parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    """Application settings.

    Defaults use PostgreSQL. The value can be
    overridden by setting `DATABASE_URL` in the backend `.env` file or the
    environment.
    """

    database_url: str = "postgresql://postgres:postgres@127.0.0.1:5433/marketplace_db"
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding='utf-8'
    )


settings = Settings()
