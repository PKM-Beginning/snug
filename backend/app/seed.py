"""Development seed: loads the DEMO catalogue (same items as the frontend mock).

    python -m app.seed            # insert/refresh demo data
    python -m app.seed --reset    # delete all demo rows first

Every product and offer is flagged is_demo=True, ratings are tagged with
rating_source="demo", and affiliate_url is left NULL — no affiliate links
are invented. Refuses to run when ENVIRONMENT=production.
"""
import argparse
import json
import sys
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.catalog_meta import Availability, Category, Gender
from app.config import get_settings
from app.db import SessionLocal
from app.models import Merchant, Offer, Product, ProductImage
from app.providers import PROVIDERS
from app.security import validate_image_url

DATA_FILE = Path(__file__).parent / "seed_data" / "demo_catalog.json"


def seed_merchants(db: Session) -> dict[str, Merchant]:
    merchants: dict[str, Merchant] = {}
    for slug, cls in PROVIDERS.items():
        m = db.scalar(select(Merchant).where(Merchant.slug == slug))
        if m is None:
            m = Merchant(slug=slug)
            db.add(m)
        m.name = cls.name
        m.website_url = cls.website_url
        m.affiliate_network = cls.affiliate_network
        m.is_active = True
        # Policies stay NULL (= provider default) until set from each programme's terms.
        merchants[slug] = m
    db.flush()
    return merchants


def reset_demo(db: Session) -> None:
    db.execute(delete(Offer).where(Offer.is_demo.is_(True)))
    demo_ids = select(Product.id).where(Product.is_demo.is_(True))
    db.execute(delete(ProductImage).where(ProductImage.product_id.in_(demo_ids)))
    db.execute(delete(Product).where(Product.is_demo.is_(True)))
    db.flush()


def seed(db: Session, reset: bool = False) -> tuple[int, int]:
    if reset:
        reset_demo(db)
    merchants = seed_merchants(db)
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    now = datetime.now(UTC)
    n_products = n_offers = 0

    for r in records:
        product = db.scalar(select(Product).where(Product.slug == r["slug"]))
        if product is None:
            product = Product(slug=r["slug"])
            db.add(product)
        elif not product.is_demo:
            continue  # never overwrite real (non-demo) data
        product.title = r["title"]
        product.brand = r["brand"]
        product.category = Category(r["category"]).value
        product.gender = Gender(r["gender"]).value
        product.description = r["description"]
        product.image_url = validate_image_url(r["image_url"])
        product.winter_score = int(r["winter_score"])
        product.rating = Decimal(str(r["rating"]))
        product.review_count = int(r["review_count"])
        product.rating_source = "demo"
        product.is_demo = True
        db.flush()
        if not product.images:
            product.images.append(ProductImage(image_url=product.image_url, position=0))
        n_products += 1

        mrp = Decimal(str(r["mrp"])).quantize(Decimal("0.01"))
        for o in r["offers"]:
            merchant = merchants[o["merchant"]]
            ext_id = f"demo-{merchant.slug}-{product.slug}"[:128]
            offer = db.scalar(select(Offer).where(Offer.merchant_id == merchant.id, Offer.external_product_id == ext_id))
            if offer is None:
                offer = Offer(merchant_id=merchant.id, external_product_id=ext_id)
                db.add(offer)
            offer.product_id = product.id
            offer.price = Decimal(str(o["price"])).quantize(Decimal("0.01"))
            offer.mrp = mrp
            offer.currency = "INR"
            offer.availability = Availability(o["availability"]).value
            offer.affiliate_url = None  # demo: no affiliate link exists
            offer.last_checked_at = now
            offer.is_demo = True
            n_offers += 1

    db.commit()
    return n_products, n_offers


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed the Snug database with DEMO data.")
    parser.add_argument("--reset", action="store_true", help="delete existing demo rows first")
    args = parser.parse_args()
    if get_settings().is_production:
        print("Refusing to seed demo data when ENVIRONMENT=production.", file=sys.stderr)
        return 1
    with SessionLocal() as db:
        products, offers = seed(db, reset=args.reset)
    print(f"Seeded {products} DEMO products and {offers} DEMO offers (affiliate URLs left empty).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
