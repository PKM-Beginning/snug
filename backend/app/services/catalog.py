"""Catalogue queries: filtering, sorting, pagination and offer comparison.

An offer is *purchasable* when it is in stock (or low stock), its merchant is
active, and it is fresher than the merchant's max_offer_age_hours policy.
Listings only include products with at least one purchasable offer; a
product's price is its cheapest purchasable offer.
"""
import math
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import Select, and_, case, exists, false, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.catalog_meta import Availability, Category, Gender, SortOption
from app.models import Merchant, Offer, Product
from app.schemas import MerchantRef, OfferOut, Page, ProductDetailOut, ProductImageOut, ProductOut


@dataclass
class ProductFilters:
    query: str | None = None
    categories: list[Category] = field(default_factory=list)
    genders: list[Gender] = field(default_factory=list)
    min_price: Decimal | None = None
    max_price: Decimal | None = None
    merchants: list[str] = field(default_factory=list)
    min_discount: int = 0
    min_rating: float | None = None


# ----------------------------------------------------------- offer freshness


def _offer_visible_clause(db: Session, now: datetime):
    """Active merchant + not older than that merchant's max_offer_age_hours."""
    policies = db.execute(select(Merchant.id, Merchant.max_offer_age_hours).where(Merchant.is_active.is_(True))).all()
    if not policies:
        return false()
    clauses = []
    for merchant_id, max_age in policies:
        if max_age is None:
            clauses.append(Offer.merchant_id == merchant_id)
        else:
            clauses.append(and_(Offer.merchant_id == merchant_id, Offer.last_checked_at >= now - timedelta(hours=max_age)))
    return or_(*clauses)


def _purchasable_clause(db: Session, now: datetime):
    return and_(Offer.availability != Availability.out_of_stock.value, _offer_visible_clause(db, now))


def _price_summary(db: Session, now: datetime):
    """Per-product best price, price spread, a conservative MRP and offer count."""
    return (
        select(
            Offer.product_id.label("product_id"),
            func.min(Offer.price).label("best_price"),
            func.max(Offer.price).label("max_price"),
            # Lowest MRP among purchasable offers, so discounts are never overstated.
            func.min(Offer.mrp).label("ref_mrp"),
            func.count(Offer.id).label("offer_count"),
        )
        .where(_purchasable_clause(db, now))
        .group_by(Offer.product_id)
        .subquery("price_summary")
    )


def _discount_expr(summary):
    raw = (summary.c.ref_mrp - summary.c.best_price) * 100 / summary.c.ref_mrp
    return case((and_(summary.c.ref_mrp.is_not(None), summary.c.ref_mrp > summary.c.best_price), raw), else_=0)


# ------------------------------------------------------------------ listing


def _apply_filters(stmt: Select, f: ProductFilters, summary, discount, db: Session, now: datetime, reliable_sources: set[str]) -> Select:
    if f.query:
        for term in f.query.lower().split()[:8]:
            like = f"%{term.rstrip('s') if len(term) > 3 else term}%"
            stmt = stmt.where(
                or_(
                    func.lower(Product.title).like(like),
                    func.lower(Product.brand).like(like),
                    func.lower(Product.description).like(like),
                    func.lower(Product.category).like(like),
                )
            )
    if f.categories:
        stmt = stmt.where(Product.category.in_([c.value for c in f.categories]))
    if f.genders:
        stmt = stmt.where(Product.gender.in_([g.value for g in f.genders]))
    if f.min_price is not None:
        stmt = stmt.where(summary.c.best_price >= f.min_price)
    if f.max_price is not None:
        stmt = stmt.where(summary.c.best_price <= f.max_price)
    if f.min_discount:
        stmt = stmt.where(discount >= f.min_discount)
    if f.merchants:
        stmt = stmt.where(
            exists()
            .where(Offer.product_id == Product.id)
            .where(Offer.merchant_id == Merchant.id)
            .where(Merchant.slug.in_(f.merchants))
            .where(_purchasable_clause(db, now))
        )
    if f.min_rating is not None:
        stmt = stmt.where(Product.rating.is_not(None), Product.rating >= f.min_rating, Product.rating_source.in_(reliable_sources))
    return stmt


def _order_by(sort: SortOption, summary, discount):
    if sort == SortOption.price_asc:
        return [summary.c.best_price.asc(), Product.id.asc()]
    if sort == SortOption.discount_desc:
        return [discount.desc(), summary.c.best_price.asc(), Product.id.asc()]
    if sort == SortOption.newest:
        return [Product.created_at.desc(), Product.id.desc()]
    # Recommended: season fit first, then value. Ratings are deliberately left
    # out until reliable rating data exists.
    return [(Product.winter_score * 0.6 + discount * 0.4).desc(), Product.id.asc()]


def list_products(
    db: Session,
    filters: ProductFilters,
    sort: SortOption,
    page: int,
    page_size: int,
    reliable_sources: set[str],
) -> Page[ProductOut]:
    now = datetime.now(UTC)
    summary = _price_summary(db, now)
    discount = _discount_expr(summary)

    base = select(Product.id).join(summary, summary.c.product_id == Product.id)
    base = _apply_filters(base, filters, summary, discount, db, now, reliable_sources)

    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    ids = db.scalars(base.order_by(*_order_by(sort, summary, discount)).offset((page - 1) * page_size).limit(page_size)).all()

    items = [to_product_out(p, now, db) for p in _load_products(db, ids)]
    return Page[ProductOut](
        items=items, page=page, page_size=page_size, total=total, total_pages=max(1, math.ceil(total / page_size)) if total else 0
    )


def list_price_gap_deals(db: Session, page: int, page_size: int) -> Page[ProductOut]:
    """Products sold by 2+ merchants, ordered by the spread between highest and lowest price."""
    now = datetime.now(UTC)
    summary = _price_summary(db, now)
    spread = summary.c.max_price - summary.c.best_price
    base = select(Product.id).join(summary, summary.c.product_id == Product.id).where(summary.c.offer_count >= 2, spread > 0)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    ids = db.scalars(base.order_by(spread.desc(), Product.id).offset((page - 1) * page_size).limit(page_size)).all()
    items = [to_product_out(p, now, db) for p in _load_products(db, ids)]
    return Page[ProductOut](items=items, page=page, page_size=page_size, total=total, total_pages=math.ceil(total / page_size) if total else 0)


def _load_products(db: Session, ids: list[int]) -> list[Product]:
    if not ids:
        return []
    rows = db.scalars(
        select(Product).where(Product.id.in_(ids)).options(selectinload(Product.offers).selectinload(Offer.merchant))
    ).all()
    by_id = {p.id: p for p in rows}
    return [by_id[i] for i in ids if i in by_id]


def get_product(db: Session, slug: str) -> ProductDetailOut | None:
    now = datetime.now(UTC)
    product = db.scalar(
        select(Product)
        .where(Product.slug == slug)
        .options(selectinload(Product.offers).selectinload(Offer.merchant), selectinload(Product.images))
    )
    if product is None:
        return None
    base = to_product_out(product, now, db)
    return ProductDetailOut(
        **base.model_dump(), images=[ProductImageOut(image_url=i.image_url, position=i.position) for i in product.images]
    )


def category_counts(db: Session) -> dict[str, int]:
    now = datetime.now(UTC)
    summary = _price_summary(db, now)
    rows = db.execute(
        select(Product.category, func.count(Product.id)).join(summary, summary.c.product_id == Product.id).group_by(Product.category)
    ).all()
    return {c: n for c, n in rows}


# ---------------------------------------------------------- offer comparison


def _is_visible(offer: Offer, now: datetime) -> bool:
    m = offer.merchant
    if not m.is_active:
        return False
    if m.max_offer_age_hours is None:
        return True
    checked = offer.last_checked_at if offer.last_checked_at.tzinfo else offer.last_checked_at.replace(tzinfo=UTC)
    return checked >= now - timedelta(hours=m.max_offer_age_hours)


def compare_offers(product: Product, now: datetime) -> tuple[list[Offer], Offer | None]:
    """Visible offers sorted purchasable-first then by price, plus the best one."""
    visible = [o for o in product.offers if _is_visible(o, now)]
    purchasable = [o for o in visible if o.availability != Availability.out_of_stock.value]
    best = min(purchasable, key=lambda o: (o.price, o.merchant.slug)) if purchasable else None
    ordered = sorted(visible, key=lambda o: (o.availability == Availability.out_of_stock.value, o.price, o.merchant.slug))
    return ordered, best


def discount_percent(best: Offer | None, purchasable_mrps: list[Decimal]) -> int:
    if best is None or not purchasable_mrps:
        return 0
    mrp = min(purchasable_mrps)
    if mrp <= best.price:
        return 0
    return int(((mrp - best.price) * 100 / mrp).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def to_product_out(p: Product, now: datetime, db: Session | None = None) -> ProductOut:
    offers, best = compare_offers(p, now)
    purchasable = [o for o in offers if o.availability != Availability.out_of_stock.value]
    mrps = [o.mrp for o in purchasable if o.mrp is not None]
    return ProductOut(
        slug=p.slug,
        title=p.title,
        description=p.description,
        brand=p.brand,
        category=Category(p.category),
        gender=Gender(p.gender),
        image_url=p.image_url,
        winter_score=p.winter_score,
        rating=p.rating,
        review_count=p.review_count,
        rating_source=p.rating_source,
        best_price=best.price if best else None,
        mrp=min(mrps) if mrps else None,
        discount_percent=discount_percent(best, mrps),
        currency=best.currency if best else "INR",
        offer_count=len(purchasable),
        offers=[
            OfferOut(
                merchant=MerchantRef(slug=o.merchant.slug, name=o.merchant.name),
                price=o.price,
                mrp=o.mrp,
                currency=o.currency,
                availability=Availability(o.availability),
                affiliate_url=o.affiliate_url,
                last_checked_at=o.last_checked_at,
                is_best=o is best,
                is_demo=o.is_demo,
            )
            for o in offers
        ],
        is_demo=p.is_demo,
        created_at=p.created_at,
    )
