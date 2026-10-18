"""Pydantic response models.

Prices are Decimal internally and in the database. They are serialised to
JSON numbers with two decimal places for the frontend, which only displays them.
"""
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, PlainSerializer

from app.catalog_meta import Availability, Category, Gender

MoneyOut = Annotated[Decimal, PlainSerializer(lambda v: float(round(v, 2)), return_type=float, when_used="json")]
RatingOut = Annotated[Decimal, PlainSerializer(lambda v: float(v), return_type=float, when_used="json")]

T = TypeVar("T")


class MerchantRef(BaseModel):
    slug: str
    name: str


class MerchantOut(MerchantRef):
    model_config = ConfigDict(from_attributes=True)
    website_url: str
    affiliate_network: str | None


class OfferOut(BaseModel):
    merchant: MerchantRef
    price: MoneyOut
    mrp: MoneyOut | None
    currency: str
    availability: Availability
    # None until a real affiliate programme issues a link — the UI shows a demo button.
    affiliate_url: str | None
    last_checked_at: datetime
    is_best: bool
    is_demo: bool


class ProductImageOut(BaseModel):
    image_url: str
    position: int


class ProductOut(BaseModel):
    slug: str
    title: str
    description: str
    brand: str
    category: Category
    gender: Gender
    image_url: str | None
    winter_score: int
    rating: RatingOut | None
    review_count: int | None
    rating_source: str | None
    best_price: MoneyOut | None
    mrp: MoneyOut | None
    discount_percent: int
    currency: str
    offer_count: int
    offers: list[OfferOut]
    is_demo: bool
    created_at: datetime


class ProductDetailOut(ProductOut):
    images: list[ProductImageOut]


class Page(BaseModel, Generic[T]):
    items: list[T]
    page: int
    page_size: int
    total: int
    total_pages: int


class CategoryOut(BaseModel):
    slug: Category
    name: str
    description: str
    product_count: int


class SyncJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    merchant_slug: str
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    products_processed: int
    error_message: str | None


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list[dict] | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody
