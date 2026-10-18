"""Marketplace provider contract.

A provider wraps ONE marketplace's *official* affiliate API or product feed.
It must never scrape websites, and it must never construct affiliate URLs
itself — it only passes through links issued by the affiliate programme.

Lifecycle used by app.services.sync:
    1. fetch_eligible_products()  → raw records from the official API/feed
    2. normalize(raw)              → NormalizedProduct (validated, typed)
    3. sync service upserts products + offers (process_offer_update)
    4. report_error(...)           → recorded on the SyncJob
"""
from __future__ import annotations

import re
from abc import ABC, abstractmethod
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation
from typing import Any

from app.catalog_meta import Availability, Category, Gender
from app.config import Settings
from app.security import UnsafeUrlError, validate_https_url, validate_image_url

SLUG_RE = re.compile(r"[^a-z0-9]+")


class ProviderError(Exception):
    """Base error for provider failures."""


class ProviderNotConfigured(ProviderError):
    """Credentials/approval for the affiliate programme are missing."""


class NormalizationError(ProviderError):
    """A raw record failed validation and was skipped."""


@dataclass(frozen=True)
class SyncPolicy:
    """Per-merchant defaults. Merchant rows in the DB can override each value.

    These are deliberately left as None/conservative: set them to whatever the
    specific affiliate agreement permits (refresh frequency, how long a price
    may be shown, whether caching is allowed).
    """

    sync_interval_minutes: int | None = None
    offer_cache_ttl_seconds: int | None = None
    max_offer_age_hours: int | None = None


@dataclass
class NormalizedOffer:
    external_product_id: str
    price: Decimal
    mrp: Decimal | None
    currency: str
    availability: Availability
    affiliate_url: str | None
    checked_at: datetime


@dataclass
class NormalizedProduct:
    slug: str
    title: str
    description: str
    brand: str
    category: Category
    gender: Gender
    image_urls: list[str]
    offer: NormalizedOffer
    winter_score: int = 50
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass
class SyncErrorReport:
    message: str
    external_product_id: str | None = None


class MarketplaceProvider(ABC):
    slug: str
    name: str
    website_url: str
    affiliate_network: str
    # Hosts that affiliate links issued by this programme may point to.
    allowed_affiliate_hosts: frozenset[str]
    default_policy: SyncPolicy = SyncPolicy()

    def __init__(self, settings: Settings):
        self.settings = settings
        self.errors: list[SyncErrorReport] = []

    # -- configuration ----------------------------------------------------
    @abstractmethod
    def is_configured(self) -> bool:
        """True only when credentials for the official programme are present."""

    # -- 1. fetch -----------------------------------------------------------
    @abstractmethod
    def fetch_eligible_products(self) -> Iterable[Mapping[str, Any]]:
        """Yield raw product/offer records from the official API or feed.

        Implementations must respect the programme's rate limits and only
        request categories/products the programme marks as eligible.
        """

    # -- 2. normalise ---------------------------------------------------------
    @abstractmethod
    def map_record(self, raw: Mapping[str, Any]) -> dict[str, Any]:
        """Translate the marketplace's raw field names into the generic keys
        consumed by normalize(): external_id, title, brand, description,
        category, gender, image_urls, price, mrp, currency, availability,
        affiliate_url."""

    def normalize(self, raw: Mapping[str, Any]) -> NormalizedProduct:
        """Validate a mapped record. Raises NormalizationError on bad data."""
        try:
            r = self.map_record(raw)
            external_id = _clean_str(r.get("external_id"), "external_id", 128)
            title = _clean_str(r.get("title"), "title", 255)
            brand = _clean_str(r.get("brand"), "brand", 120)
            description = str(r.get("description") or "")[:5000]
            category = Category(str(r.get("category", "")).lower())
            gender = Gender(str(r.get("gender", "unisex")).lower())
            price = _money(r.get("price"), "price")
            mrp = _money(r["mrp"], "mrp") if r.get("mrp") not in (None, "") else None
            if mrp is not None and mrp < price:
                mrp = None  # inconsistent MRP: drop it rather than invent a discount
            currency = str(r.get("currency") or "INR").upper()
            if not re.fullmatch(r"[A-Z]{3}", currency):
                raise NormalizationError("currency must be a 3-letter ISO code")
            availability = Availability(str(r.get("availability", "in_stock")))
            affiliate_url = r.get("affiliate_url")
            if affiliate_url:
                affiliate_url = validate_https_url(str(affiliate_url), self.allowed_affiliate_hosts)
            images = [validate_image_url(str(u)) for u in (r.get("image_urls") or [])][:10]
        except (KeyError, ValueError, InvalidOperation, UnsafeUrlError) as exc:
            raise NormalizationError(str(exc)) from exc

        slug = SLUG_RE.sub("-", f"{brand} {title}".lower()).strip("-")[:150]
        return NormalizedProduct(
            slug=slug,
            title=title,
            description=description,
            brand=brand,
            category=category,
            gender=gender,
            image_urls=images,
            offer=NormalizedOffer(
                external_product_id=external_id,
                price=price,
                mrp=mrp,
                currency=currency,
                availability=availability,
                affiliate_url=affiliate_url or None,
                checked_at=datetime.now(UTC),
            ),
        )

    # -- 3. offer updates -------------------------------------------------
    def process_offer_update(self, raw: Mapping[str, Any]) -> NormalizedOffer:
        """Normalise a price/stock-only update (e.g. from a feed delta)."""
        return self.normalize(raw).offer

    # -- 4. errors -----------------------------------------------------------
    def report_error(self, message: str, external_product_id: str | None = None) -> None:
        self.errors.append(SyncErrorReport(message=message[:500], external_product_id=external_product_id))


class UnconfiguredProvider(MarketplaceProvider):
    """Shared behaviour for providers whose real API is not connected yet."""

    credential_settings: tuple[str, ...] = ()

    def is_configured(self) -> bool:
        def present(name: str) -> bool:
            v = getattr(self.settings, name, None)
            if v is None:
                return False
            return bool(v.get_secret_value() if hasattr(v, "get_secret_value") else v)

        return bool(self.credential_settings) and all(present(n) for n in self.credential_settings)

    def fetch_eligible_products(self) -> Iterable[Mapping[str, Any]]:
        if not self.is_configured():
            raise ProviderNotConfigured(f"{self.name} affiliate credentials are not configured.")
        # Even with credentials present, the client is intentionally not built yet.
        raise ProviderNotConfigured(f"{self.name} API integration is not implemented yet (Phase 3).")


def _clean_str(value: Any, name: str, max_len: int) -> str:
    s = " ".join(str(value or "").split())
    if not s:
        raise NormalizationError(f"{name} is required")
    return s[:max_len]


def _money(value: Any, name: str) -> Decimal:
    if isinstance(value, float):
        value = repr(value)  # avoid binary float artefacts
    d = Decimal(str(value)).quantize(Decimal("0.01"))
    if d < 0 or d > Decimal("10000000"):
        raise NormalizationError(f"{name} out of range")
    return d
