"""Test setup: an isolated SQLite database seeded with the demo catalogue.

SQLite keeps the suite runnable anywhere (no Postgres needed). Queries use
only portable SQL; the Postgres DDL is checked in test_migrations.py.
"""
import os
import tempfile
from pathlib import Path

_tmp = Path(tempfile.mkdtemp(prefix="snug-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp / 'test.db'}"
os.environ["ENVIRONMENT"] = "test"
os.environ["RATE_LIMIT_PER_MINUTE"] = "100000"
os.environ["ADMIN_API_KEY"] = ""
os.environ["RELIABLE_RATING_SOURCES"] = ""
os.environ["CORS_ORIGINS"] = "http://localhost:3000"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.config import get_settings  # noqa: E402
from app.db import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.security import limiter  # noqa: E402
from app.seed import seed  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _database():
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield
    engine.dispose()


@pytest.fixture()
def client():
    limiter.reset()
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def db():
    with SessionLocal() as s:
        yield s


@pytest.fixture()
def env(monkeypatch):
    """Temporarily change settings via environment variables."""

    def _set(**values):
        for k, v in values.items():
            monkeypatch.setenv(k.upper(), str(v))
        get_settings.cache_clear()

    yield _set
    get_settings.cache_clear()
