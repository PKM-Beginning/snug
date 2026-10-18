"""The Alembic migration must create exactly the schema the models describe."""
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect

from app.db import Base

BACKEND = Path(__file__).resolve().parents[1]


def _alembic(*args: str, url: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "alembic", *args],
        cwd=BACKEND,
        env={"DATABASE_URL": url, "PATH": "", "PYTHONPATH": str(BACKEND), "SYSTEMROOT": __import__("os").environ.get("SYSTEMROOT", "")},
        capture_output=True,
        text=True,
    )


def test_upgrade_and_downgrade_sqlite(tmp_path):
    url = f"sqlite:///{tmp_path / 'm.db'}"
    up = _alembic("upgrade", "head", url=url)
    assert up.returncode == 0, up.stderr
    tables = set(inspect(create_engine(url)).get_table_names()) - {"alembic_version"}
    assert tables == set(Base.metadata.tables)
    down = _alembic("downgrade", "base", url=url)
    assert down.returncode == 0, down.stderr


def test_postgres_ddl_renders_with_numeric_money():
    out = _alembic("upgrade", "head", "--sql", url="postgresql+psycopg://u:p@localhost/snug")
    assert out.returncode == 0, out.stderr
    sql = out.stdout
    assert "price NUMERIC(10, 2) NOT NULL" in sql
    assert "CONSTRAINT uq_offers_merchant_external_id UNIQUE (merchant_id, external_product_id)" in sql
    assert "REFERENCES products (id) ON DELETE CASCADE" in sql
    assert "FLOAT" not in sql.upper()
