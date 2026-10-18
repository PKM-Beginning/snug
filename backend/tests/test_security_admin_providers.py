from collections.abc import Iterable, Mapping
from decimal import Decimal
from typing import Any

import pytest
from sqlalchemy import select

from app.config import get_settings
from app.models import Merchant, Offer, Product, SyncJob
from app.providers.amazon import AmazonProvider
from app.providers.base import MarketplaceProvider, NormalizationError, ProviderNotConfigured
from app.security import UnsafeUrlError, validate_https_url, validate_image_url
from app.services.sync import SyncNotDue, run_sync

# ------------------------------------------------------------------- admin


def test_admin_disabled_without_key(client):
    assert client.get("/api/admin/sync-jobs").status_code == 404
    assert client.post("/api/admin/merchants/amazon/sync").status_code == 404


def test_admin_rejects_missing_or_wrong_key(client, env):
    env(admin_api_key="correct-horse-battery-staple")
    assert client.get("/api/admin/sync-jobs").status_code == 401
    r = client.get("/api/admin/sync-jobs", headers={"X-Admin-Key": "nope"})
    assert r.status_code == 401 and r.json()["error"]["code"] == "unauthorized"


def test_admin_sync_reports_unconfigured_provider(client, env):
    env(admin_api_key="k3y")
    r = client.post("/api/admin/merchants/amazon/sync", headers={"X-Admin-Key": "k3y"})
    assert r.status_code == 202
    job = r.json()
    assert job["status"] == "failed"
    assert "not configured" in job["error_message"]
    assert job["products_processed"] == 0
    assert r.headers["cache-control"] == "no-store"
    jobs = client.get("/api/admin/sync-jobs", headers={"X-Admin-Key": "k3y"}).json()
    assert jobs[0]["id"] == job["id"]


def test_admin_unknown_merchant(client, env):
    env(admin_api_key="k3y")
    r = client.post("/api/admin/merchants/ebay/sync", headers={"X-Admin-Key": "k3y"})
    assert r.status_code == 404 and r.json()["error"]["code"] == "merchant_not_found"


def test_admin_not_in_public_openapi(client):
    assert "/api/admin/sync-jobs" not in client.get("/openapi.json").json()["paths"]


# ---------------------------------------------------- rate limiting & CORS


def test_rate_limit_returns_429(client, env):
    env(rate_limit_per_minute=3)
    codes = [client.get("/api/categories").status_code for _ in range(4)]
    assert codes == [200, 200, 200, 429]
    r = client.get("/api/categories")
    assert r.json()["error"]["code"] == "rate_limited" and int(r.headers["retry-after"]) > 0


def test_cors_allows_configured_origin_only(client):
    ok = client.get("/api/categories", headers={"Origin": "http://localhost:3000"})
    assert ok.headers["access-control-allow-origin"] == "http://localhost:3000"
    bad = client.get("/api/categories", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in bad.headers


def test_cors_does_not_allow_write_methods(client):
    r = client.options(
        "/api/admin/merchants/amazon/sync",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"},
    )
    assert "POST" not in r.headers.get("access-control-allow-methods", "")


def test_security_headers(client):
    r = client.get("/api/health")
    assert r.json() == {"status": "ok"}
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["x-frame-options"] == "DENY"


# ---------------------------------------------------------- URL validation


@pytest.mark.parametrize(
    "url",
    [
        "http://www.amazon.in/dp/X",  # not https
        "javascript:alert(1)",
        "https://user:pass@amazon.in/x",
        "https://amazon.in.evil.example/x",  # look-alike host
        "https://evil.example/?u=amazon.in",
        "https://amazon.in/a b",
        "",
    ],
)
def test_unsafe_affiliate_urls_rejected(url):
    with pytest.raises(UnsafeUrlError):
        validate_https_url(url, frozenset({"amazon.in", "amzn.to"}))


def test_allowed_affiliate_url_and_subdomain():
    assert validate_https_url("https://www.amazon.in/dp/B0TEST", frozenset({"amazon.in"}))


def test_image_url_rules():
    assert validate_image_url("/images/products/x.jpg")
    with pytest.raises(UnsafeUrlError):
        validate_image_url("/images/../../etc/passwd")
    with pytest.raises(UnsafeUrlError):
        validate_image_url("data:image/png;base64,AAAA")


# --------------------------------------------------------------- providers


def test_real_providers_are_not_connected():
    provider = AmazonProvider(get_settings())
    assert provider.is_configured() is False
    with pytest.raises(ProviderNotConfigured):
        list(provider.fetch_eligible_products())


class FakeProvider(MarketplaceProvider):
    """Stands in for a future official-API provider."""

    slug = "flipkart"
    name = "Flipkart"
    website_url = "https://www.flipkart.com"
    affiliate_network = "Test"
    allowed_affiliate_hosts = frozenset({"flipkart.com"})

    def __init__(self, records):
        super().__init__(get_settings())
        self.records = records

    def is_configured(self) -> bool:
        return True

    def fetch_eligible_products(self) -> Iterable[Mapping[str, Any]]:
        return self.records

    def map_record(self, raw):
        return dict(raw)


GOOD = {
    "id": "FK-1",
    "external_id": "FK-1",
    "title": "Test Fleece Jacket",
    "brand": "Testbrand",
    "category": "jackets",
    "gender": "men",
    "price": 999.9,
    "mrp": "1999",
    "availability": "in_stock",
    "affiliate_url": "https://dl.flipkart.com/dl/test?affid=TEST",
    "image_urls": ["https://img.example-cdn.com/fk1.jpg"],
}


def test_normalize_valid_record_uses_decimal():
    item = FakeProvider([]).normalize(GOOD)
    assert item.offer.price == Decimal("999.90") and isinstance(item.offer.price, Decimal)
    assert item.slug == "testbrand-test-fleece-jacket"


@pytest.mark.parametrize(
    "patch",
    [
        {"affiliate_url": "https://amazon.in/not-flipkart"},
        {"affiliate_url": "http://dl.flipkart.com/insecure"},
        {"category": "swimwear"},
        {"price": -5},
        {"title": "   "},
        {"currency": "RUPEES"},
    ],
)
def test_normalize_rejects_bad_records(patch):
    with pytest.raises(NormalizationError):
        FakeProvider([]).normalize({**GOOD, **patch})


def test_inconsistent_mrp_is_dropped_not_trusted():
    item = FakeProvider([]).normalize({**GOOD, "mrp": 500})
    assert item.offer.mrp is None


def test_sync_upserts_valid_records_and_reports_invalid(db):
    merchant = db.scalar(select(Merchant).where(Merchant.slug == "flipkart"))
    bad = {**GOOD, "id": "FK-2", "external_id": "FK-2", "affiliate_url": "https://evil.example/x"}
    job = run_sync(db, merchant, FakeProvider([GOOD, bad]), force=True)
    assert job.status == "succeeded"
    assert job.products_processed == 1
    assert "FK-2" in job.error_message and "not allowed" in job.error_message

    product = db.scalar(select(Product).where(Product.slug == "testbrand-test-fleece-jacket"))
    assert product is not None and product.is_demo is False
    offer = db.scalar(select(Offer).where(Offer.external_product_id == "FK-1"))
    assert offer.price == Decimal("999.90")
    assert offer.affiliate_url == GOOD["affiliate_url"]

    # Re-running updates in place rather than duplicating.
    run_sync(db, merchant, FakeProvider([{**GOOD, "price": 899}]), force=True)
    assert db.scalar(select(Offer).where(Offer.external_product_id == "FK-1")).price == Decimal("899.00")
    assert len(db.scalars(select(Offer).where(Offer.external_product_id == "FK-1")).all()) == 1

    # Clean up so other tests see only demo data.
    db.delete(product)
    db.commit()


def test_sync_respects_merchant_interval(db):
    merchant = db.scalar(select(Merchant).where(Merchant.slug == "flipkart"))
    try:
        merchant.sync_interval_minutes = 60
        db.commit()
        run_sync(db, merchant, FakeProvider([]), force=True)
        with pytest.raises(SyncNotDue):
            run_sync(db, merchant, FakeProvider([]))
    finally:
        merchant.sync_interval_minutes = None
        db.query(SyncJob).delete()
        db.commit()
