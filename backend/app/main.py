"""FastAPI application factory.  Run:  uvicorn app.main:app --reload"""
import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.errors import AppError, register_error_handlers
from app.routers import admin, catalog
from app.security import RateLimitMiddleware, SecurityHeadersMiddleware

logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Snug API",
        description="Stay Warm. Spend Less. — winter fashion offer comparison.",
        version="0.2.0",
        # Interactive docs only outside production.
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    # Order: last added runs first. CORS must wrap everything (incl. 429s).
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["Accept", "Content-Type"],
        max_age=600,
    )

    register_error_handlers(app)
    app.include_router(catalog.router)
    app.include_router(admin.router)

    @app.get("/api/health", tags=["meta"])
    def health(db: Session = Depends(get_db)):
        try:
            db.execute(text("SELECT 1"))
        except Exception:
            raise AppError(503, "database_unavailable", "Database is unavailable.")
        return {"status": "ok"}

    return app


app = create_app()
