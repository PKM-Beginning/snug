"""Runs one synchronisation for one merchant and records it as a SyncJob.

Phase 2: providers are not connected, so jobs fail fast with a clear
"not configured" message. The upsert logic below is complete and tested
with a fake provider, so Phase 3 only needs to implement each provider.
"""
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.catalog_meta import SyncStatus
from app.models import Merchant, Offer, Product, ProductImage, SyncJob
from app.providers.base import MarketplaceProvider, NormalizationError, NormalizedProduct, ProviderError


class SyncNotDue(Exception):
    def __init__(self, next_run_at: datetime):
        self.next_run_at = next_run_at


def effective_interval(merchant: Merchant, provider: MarketplaceProvider) -> int | None:
    return merchant.sync_interval_minutes or provider.default_policy.sync_interval_minutes


def ensure_due(db: Session, merchant: Merchant, provider: MarketplaceProvider, now: datetime) -> None:
    """Refuse to run more often than the merchant's configured interval."""
    interval = effective_interval(merchant, provider)
    if not interval:
        return
    last = db.scalar(
        select(SyncJob.started_at)
        .where(SyncJob.merchant_id == merchant.id, SyncJob.status == SyncStatus.succeeded.value)
        .order_by(SyncJob.started_at.desc())
        .limit(1)
    )
    if last is not None:
        last = last if last.tzinfo else last.replace(tzinfo=UTC)
        next_run = last + timedelta(minutes=interval)
        if now < next_run:
            raise SyncNotDue(next_run)


def upsert(db: Session, merchant: Merchant, item: NormalizedProduct, is_demo: bool = False) -> None:
    product = db.scalar(select(Product).where(Product.slug == item.slug))
    if product is None:
        product = Product(slug=item.slug, is_demo=is_demo)
        db.add(product)
    product.title = item.title
    product.description = item.description
    product.brand = item.brand
    product.category = item.category.value
    product.gender = item.gender.value
    product.winter_score = item.winter_score
    if item.image_urls:
        product.image_url = item.image_urls[0]
        product.images.clear()
        db.flush()
        product.images.extend(ProductImage(image_url=u, position=i) for i, u in enumerate(item.image_urls))
    db.flush()

    o = item.offer
    offer = db.scalar(
        select(Offer).where(Offer.merchant_id == merchant.id, Offer.external_product_id == o.external_product_id)
    )
    if offer is None:
        offer = Offer(merchant_id=merchant.id, external_product_id=o.external_product_id, is_demo=is_demo)
        db.add(offer)
    offer.product_id = product.id
    offer.price = o.price
    offer.mrp = o.mrp
    offer.currency = o.currency
    offer.availability = o.availability.value
    offer.affiliate_url = o.affiliate_url
    offer.last_checked_at = o.checked_at


def run_sync(db: Session, merchant: Merchant, provider: MarketplaceProvider, *, force: bool = False) -> SyncJob:
    now = datetime.now(UTC)
    if not force:
        ensure_due(db, merchant, provider, now)

    job = SyncJob(merchant_id=merchant.id, status=SyncStatus.running.value, started_at=now)
    db.add(job)
    db.commit()

    processed = 0
    try:
        for raw in provider.fetch_eligible_products():
            try:
                item = provider.normalize(raw)
            except NormalizationError as exc:
                provider.report_error(f"Skipped invalid record: {exc}", str(raw.get("id", "")) if hasattr(raw, "get") else None)
                continue
            upsert(db, merchant, item)
            processed += 1
        db.commit()
        job.status = SyncStatus.succeeded.value
        if provider.errors:
            job.error_message = _summarise(provider)
    except ProviderError as exc:
        db.rollback()
        job.status = SyncStatus.failed.value
        provider.report_error(str(exc))
        job.error_message = _summarise(provider)
    except Exception as exc:  # never leave a job stuck in "running"
        db.rollback()
        job.status = SyncStatus.failed.value
        job.error_message = f"Unexpected error: {type(exc).__name__}"
    finally:
        job.products_processed = processed
        job.completed_at = datetime.now(UTC)
        db.add(job)
        db.commit()
    return job


def _summarise(provider: MarketplaceProvider) -> str:
    lines = [e.message if not e.external_product_id else f"[{e.external_product_id}] {e.message}" for e in provider.errors[:20]]
    more = len(provider.errors) - len(lines)
    if more > 0:
        lines.append(f"…and {more} more")
    return "\n".join(lines)[:4000]
