from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import dotenv_values, load_dotenv
from pathlib import Path

_root_env = Path(__file__).resolve().parent.parent / ".env"
_file_cfg = dotenv_values(_root_env)
load_dotenv(_root_env)

_db_url = _file_cfg.get("DATA_BASE_URL")
if not _db_url:
    _password = _file_cfg.get("POSTGRES_PASSWORD") or "change_me"
    _db_url = f"postgresql+psycopg://postgres:{_password}@127.0.0.1:5433/dream_team_db"
SQLALCHEMY_DATABASE_URL = str(_db_url)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    with SessionLocal() as db:
        yield db