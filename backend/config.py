from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

_root_env = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_root_env,
        env_file_encoding="utf-8",
        extra="ignore",
    )
    secret_key: SecretStr
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10


settings = Settings()  # type: ignore[call-arg] # Loaded from the root .env file
