"""Public, read-only catalogue endpoints."""
import re
from decimal import Decimal
from enum import StrEnum
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Path, Query, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.catalog_meta import CATEGORY_INFO, Category, Gender, SortOption
from app.config import Settings, get_settings
from app.db import get_db
from app.errors import AppError
from app.models import Merchant
from app.schemas import CategoryOut, ErrorResponse, MerchantOut, Page, ProductDetailOut, ProductOut
from app.services import catalog

router = APIRouter(prefix="/api", tags=["catalog"])

ERRORS = {422: {"model": ErrorResponse}, 429: {"model": ErrorResponse}}
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_PAGE_SIZE = 60
DEFAULT_CACHE_SECONDS = 60


def _csv_enum(raw: str | None, enum: type[StrEnum], field: str) -> list:
    if not raw:
        return []
    out = []
    for part in raw.split(","):
        value = part.strip().lower()
        if not value:
            continue
        try:
            out.append(enum(value))
        except ValueError:
            allowed = ", ".join(e.value for e in enum)
            raise AppError(422, "validation_error", "One or more request parameters are invalid.", [{"field": field, "message": f"'{value[:40]}' is not one of: {allowed}"}])
    return list(dict.fromkeys(out))


def _csv_slugs(raw: str | None, field: str) -> list[str]:
    if not raw:
        return []
    slugs = [s.strip().lower() for s in raw.split(",") if s.strip()]
    bad = [s for s in slugs if not SLUG_RE.match(s) or len(s) > 40]
    if bad or len(slugs) > 10:
        raise AppError(422, "validation_error", "One or more request parameters are invalid.", [{"field": field, "message": "Expected up to 10 comma-separated slugs"}])
    return slugs


class ListParams:
    """Shared query parameters for /products, /search and /deals."""

    def __init__(
        self,
        category: Annotated[str | None, Query(max_length=200, description="Comma-separated categories")] = None,
        gender: Annotated[str | None, Query(max_length=100, description="Comma-separated genders")] = None,
        merchant: Annotated[str | None, Query(max_length=200, description="Comma-separated merchant slugs")] = None,
        min_price: Annotated[Decimal | None, Query(ge=0, le=1_000_000, decimal_places=2)] = None,
        max_price: Annotated[Decimal | None, Query(ge=0, le=1_000_000, decimal_places=2)] = None,
        min_discount: Annotated[int, Query(ge=0, le=100)] = 0,
        min_rating: Annotated[float | None, Query(ge=0, le=5)] = None,
        sort: SortOption = SortOption.recommended,
        page: Annotated[int, Query(ge=1, le=10_000)] = 1,
        page_size: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = 24,
    ):
        if min_price is not None and max_price is not None and min_price > max_price:
            raise AppError(422, "validation_error", "One or more request parameters are invalid.", [{"field": "min_price", "message": "min_price must not exceed max_price"}])
        self.filters = catalog.ProductFilters(
            categories=_csv_enum(category, Category, "category"),
            genders=_csv_enum(gender, Gender, "gender"),
            merchants=_csv_slugs(merchant, "merchant"),
            min_price=min_price,
            max_price=max_price,
            min_discount=min_discount,
            min_rating=min_rating,
        )
        self.sort = sort
        self.page = page
        self.page_size = page_size


def _check_rating_filter(params: ListParams, settings: Settings) -> set[str]:
    sources = settings.reliable_rating_source_set
    if params.filters.min_rating is not None and not sources:
        raise AppError(
            400,
            "rating_filter_unavailable",
            "Rating filtering is disabled until reliable rating data is available.",
            [{"field": "min_rating", "message": "No reliable rating source is configured"}],
        )
    return sources


def _cache_headers(response: Response, db: Session) -> None:
    """Public cache lifetime = the strictest offer_cache_ttl_seconds of any active merchant."""
    ttl = db.scalar(select(func.min(Merchant.offer_cache_ttl_seconds)).where(Merchant.is_active.is_(True)))
    seconds = DEFAULT_CACHE_SECONDS if ttl is None else min(ttl, DEFAULT_CACHE_SECONDS)
    response.headers["Cache-Control"] = f"public, max-age={seconds}" if seconds > 0 else "no-store"


@router.get("/products", response_model=Page[ProductOut], responses=ERRORS)
def list_products(
    response: Response,
    params: Annotated[ListParams, Depends()],
    q: Annotated[str | None, Query(max_length=80)] = None,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    sources = _check_rating_filter(params, settings)
    params.filters.query = q.strip() if q and q.strip() else None
    _cache_headers(response, db)
    return catalog.list_products(db, params.filters, params.sort, params.page, params.page_size, sources)


@router.get("/search", response_model=Page[ProductOut], responses=ERRORS)
def search(
    response: Response,
    params: Annotated[ListParams, Depends()],
    q: Annotated[str, Query(min_length=1, max_length=80, description="Search terms")],
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    if not q.strip():
        raise AppError(422, "validation_error", "One or more request parameters are invalid.", [{"field": "q", "message": "Search query must not be blank"}])
    sources = _check_rating_filter(params, settings)
    params.filters.query = q.strip()
    _cache_headers(response, db)
    return catalog.list_products(db, params.filters, params.sort, params.page, params.page_size, sources)


@router.get("/products/{slug}", response_model=ProductDetailOut, responses={404: {"model": ErrorResponse}, **ERRORS})
def get_product(response: Response, slug: Annotated[str, Path(max_length=160)], db: Session = Depends(get_db)):
    if not SLUG_RE.match(slug):
        raise AppError(404, "product_not_found", "Product not found.")
    product = catalog.get_product(db, slug)
    if product is None:
        raise AppError(404, "product_not_found", "Product not found.")
    _cache_headers(response, db)
    return product


@router.get("/deals", response_model=Page[ProductOut], responses=ERRORS)
def deals(
    response: Response,
    params: Annotated[ListParams, Depends()],
    type: Annotated[Literal["discount", "price_gap"], Query(description="discount = biggest % off; price_gap = biggest spread between stores")] = "discount",
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    _cache_headers(response, db)
    if type == "price_gap":
        return catalog.list_price_gap_deals(db, params.page, params.page_size)
    sources = _check_rating_filter(params, settings)
    if params.filters.min_discount == 0:
        params.filters.min_discount = 50
    sort = SortOption.discount_desc if params.sort == SortOption.recommended else params.sort
    return catalog.list_products(db, params.filters, sort, params.page, params.page_size, sources)


@router.get("/categories", response_model=list[CategoryOut])
def categories(response: Response, db: Session = Depends(get_db)):
    counts = catalog.category_counts(db)
    _cache_headers(response, db)
    return [CategoryOut(slug=c, name=info["name"], description=info["description"], product_count=counts.get(c.value, 0)) for c, info in CATEGORY_INFO.items()]


@router.get("/merchants", response_model=list[MerchantOut])
def merchants(response: Response, db: Session = Depends(get_db)):
    _cache_headers(response, db)
    return db.scalars(select(Merchant).where(Merchant.is_active.is_(True)).order_by(Merchant.name)).all()
