"""Administrative endpoints. Require the X-Admin-Key header; disabled entirely
(404) when ADMIN_API_KEY is not configured. Strictly rate-limited."""
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.config import Settings, get_settings
from app.db import get_db
from app.errors import AppError
from app.models import Merchant, SyncJob
from app.providers import get_provider
from app.schemas import ErrorResponse, SyncJobOut
from app.security import require_admin
from app.services.sync import SyncNotDue, run_sync

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
    include_in_schema=False,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)


def _out(job: SyncJob) -> SyncJobOut:
    return SyncJobOut(
        id=job.id,
        merchant_slug=job.merchant.slug,
        status=job.status,
        started_at=job.started_at,
        completed_at=job.completed_at,
        products_processed=job.products_processed,
        error_message=job.error_message,
    )


@router.get("/sync-jobs", response_model=list[SyncJobOut])
def list_sync_jobs(limit: Annotated[int, Query(ge=1, le=100)] = 20, db: Session = Depends(get_db)):
    jobs = db.scalars(select(SyncJob).options(joinedload(SyncJob.merchant)).order_by(SyncJob.id.desc()).limit(limit)).all()
    return [_out(j) for j in jobs]


@router.post("/merchants/{slug}/sync", response_model=SyncJobOut, status_code=202)
def trigger_sync(
    slug: Annotated[str, Path(pattern=r"^[a-z0-9-]{1,40}$")],
    force: bool = False,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    merchant = db.scalar(select(Merchant).where(Merchant.slug == slug))
    if merchant is None:
        raise AppError(404, "merchant_not_found", "Merchant not found.")
    if not merchant.is_active:
        raise AppError(409, "merchant_inactive", "Merchant is not active.")
    provider = get_provider(slug, settings)
    if provider is None:
        raise AppError(409, "no_provider", "No marketplace provider is registered for this merchant.")
    try:
        job = run_sync(db, merchant, provider, force=force)
    except SyncNotDue as exc:
        raise AppError(409, "sync_not_due", f"Next sync allowed after {exc.next_run_at.isoformat()}.")
    job.merchant = merchant
    return _out(job)
