"""SQLAlchemy 2.0 models.

Money is always Numeric(10, 2) (Python Decimal) — never float.
Vocabulary columns are VARCHAR + CHECK constraints rather than native enums,
which keeps migrations simple when a value is added later.
"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.catalog_meta import Availability, Category, Gender, SyncStatus, sql_in
from app.db import Base

Money = Numeric(10, 2)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    brand: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    gender: Mapped[str] = mapped_column(String(16), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(1024))
    winter_score: Mapped[int] = mapped_column(Integer, nullable=False, default=50)

    # Optional ratings. Only filterable when rating_source is configured as
    # reliable (see Settings.reliable_rating_sources); otherwise display-only.
    rating: Mapped[Decimal | None] = mapped_column(Numeric(2, 1))
    review_count: Mapped[int | None] = mapped_column(Integer)
    rating_source: Mapped[str | None] = mapped_column(String(32))

    # True for seed/demo rows. Real feed data must set this to False.
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    offers: Mapped[list["Offer"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.position"
    )

    __table_args__ = (
        UniqueConstraint("slug", name="uq_products_slug"),
        CheckConstraint(f"category IN ({sql_in(Category)})", name="ck_products_category"),
        CheckConstraint(f"gender IN ({sql_in(Gender)})", name="ck_products_gender"),
        CheckConstraint("winter_score BETWEEN 0 AND 100", name="ck_products_winter_score"),
        CheckConstraint("rating IS NULL OR (rating >= 0 AND rating <= 5)", name="ck_products_rating"),
        CheckConstraint("review_count IS NULL OR review_count >= 0", name="ck_products_review_count"),
        Index("ix_products_category_gender", "category", "gender"),
        Index("ix_products_brand", "brand"),
        Index("ix_products_created_at", "created_at"),
    )


class Merchant(TimestampMixin, Base):
    __tablename__ = "merchants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(40), nullable=False)
    website_url: Mapped[str] = mapped_column(String(255), nullable=False)
    affiliate_network: Mapped[str | None] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    # Per-merchant policies. NULL = use the provider's default. Set these to
    # whatever each affiliate programme's agreement permits.
    sync_interval_minutes: Mapped[int | None] = mapped_column(Integer)
    offer_cache_ttl_seconds: Mapped[int | None] = mapped_column(Integer)
    # Offers older than this are hidden instead of showing a stale price.
    max_offer_age_hours: Mapped[int | None] = mapped_column(Integer)

    offers: Mapped[list["Offer"]] = relationship(back_populates="merchant")
    sync_jobs: Mapped[list["SyncJob"]] = relationship(back_populates="merchant")

    __table_args__ = (
        UniqueConstraint("slug", name="uq_merchants_slug"),
        CheckConstraint("sync_interval_minutes IS NULL OR sync_interval_minutes > 0", name="ck_merchants_sync_interval"),
        CheckConstraint("offer_cache_ttl_seconds IS NULL OR offer_cache_ttl_seconds >= 0", name="ck_merchants_cache_ttl"),
        CheckConstraint("max_offer_age_hours IS NULL OR max_offer_age_hours > 0", name="ck_merchants_max_offer_age"),
    )


class Offer(TimestampMixin, Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    merchant_id: Mapped[int] = mapped_column(ForeignKey("merchants.id", ondelete="RESTRICT"), nullable=False)
    external_product_id: Mapped[str] = mapped_column(String(128), nullable=False)
    price: Mapped[Decimal] = mapped_column(Money, nullable=False)
    mrp: Mapped[Decimal | None] = mapped_column(Money)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR", server_default="INR")
    availability: Mapped[str] = mapped_column(String(16), nullable=False, default=Availability.in_stock.value)
    # NULL until a real affiliate programme issues a link. Never fabricated.
    affiliate_url: Mapped[str | None] = mapped_column(String(2048))
    last_checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    product: Mapped[Product] = relationship(back_populates="offers")
    merchant: Mapped[Merchant] = relationship(back_populates="offers")

    __table_args__ = (
        UniqueConstraint("merchant_id", "external_product_id", name="uq_offers_merchant_external_id"),
        CheckConstraint("price >= 0", name="ck_offers_price_nonnegative"),
        CheckConstraint("mrp IS NULL OR mrp >= price", name="ck_offers_mrp_gte_price"),
        CheckConstraint("length(currency) = 3", name="ck_offers_currency_len"),
        CheckConstraint(f"availability IN ({sql_in(Availability)})", name="ck_offers_availability"),
        Index("ix_offers_product_price", "product_id", "price"),
        Index("ix_offers_merchant_id", "merchant_id"),
        Index("ix_offers_last_checked_at", "last_checked_at"),
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    product: Mapped[Product] = relationship(back_populates="images")

    __table_args__ = (
        UniqueConstraint("product_id", "position", name="uq_product_images_position"),
        CheckConstraint("position >= 0", name="ck_product_images_position"),
    )


class SyncJob(Base):
    __tablename__ = "sync_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    merchant_id: Mapped[int] = mapped_column(ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default=SyncStatus.pending.value)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    products_processed: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    error_message: Mapped[str | None] = mapped_column(Text)

    merchant: Mapped[Merchant] = relationship(back_populates="sync_jobs")

    __table_args__ = (
        CheckConstraint(f"status IN ({sql_in(SyncStatus)})", name="ck_sync_jobs_status"),
        CheckConstraint("products_processed >= 0", name="ck_sync_jobs_processed"),
        Index("ix_sync_jobs_merchant_started", "merchant_id", "started_at"),
        Index("ix_sync_jobs_status", "status"),
    )
