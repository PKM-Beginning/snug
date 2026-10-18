from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.models import Merchant, Offer, Product


def test_list_products_envelope(client):
    r = client.get("/api/products", params={"page_size": 10})
    assert r.status_code == 200
    body = r.json()
    assert set(body) == {"items", "page", "page_size", "total", "total_pages"}
    assert body["total"] == 26
    assert body["page_size"] == 10
    assert body["total_pages"] == 3
    assert len(body["items"]) == 10


def test_pagination_pages_do_not_overlap(client):
    first = {p["slug"] for p in client.get("/api/products", params={"page": 1, "page_size": 10}).json()["items"]}
    second = {p["slug"] for p in client.get("/api/products", params={"page": 2, "page_size": 10}).json()["items"]}
    last = client.get("/api/products", params={"page": 3, "page_size": 10}).json()["items"]
    assert first.isdisjoint(second)
    assert len(last) == 6


def test_page_beyond_end_is_empty_not_error(client):
    r = client.get("/api/products", params={"page": 99})
    assert r.status_code == 200
    assert r.json()["items"] == []


def test_demo_data_is_flagged_and_has_no_affiliate_links(client):
    for p in client.get("/api/products", params={"page_size": 60}).json()["items"]:
        assert p["is_demo"] is True
        assert p["rating_source"] == "demo"
        for o in p["offers"]:
            assert o["is_demo"] is True
            assert o["affiliate_url"] is None


def test_product_detail(client):
    r = client.get("/api/products/northvale-mens-puffer-jacket")
    assert r.status_code == 200
    p = r.json()
    assert p["title"] == "Men's Quilted Puffer Jacket"
    assert p["best_price"] == 1299.0
    assert p["mrp"] == 3199.0
    assert p["discount_percent"] == 59
    assert p["images"] and p["images"][0]["position"] == 0


def test_offer_comparison_orders_by_price_and_flags_best(client):
    offers = client.get("/api/products/northvale-mens-puffer-jacket").json()["offers"]
    assert [o["merchant"]["slug"] for o in offers] == ["flipkart", "amazon", "myntra"]
    assert [o["price"] for o in offers] == [1299.0, 1399.0, 1499.0]
    assert [o["is_best"] for o in offers] == [True, False, False]


def test_out_of_stock_offer_is_never_best(client):
    # Flipkart is out of stock for the parka at 2399; Myntra (2299) is best,
    # and the out-of-stock offer is listed last.
    p = client.get("/api/products/polar-thread-womens-long-parka").json()
    assert p["best_price"] == 2299.0
    assert p["offer_count"] == 2
    assert p["offers"][-1]["availability"] == "out_of_stock"
    assert p["offers"][-1]["is_best"] is False


def test_missing_product_returns_structured_404(client):
    r = client.get("/api/products/does-not-exist")
    assert r.status_code == 404
    assert r.json() == {"error": {"code": "product_not_found", "message": "Product not found."}}


def test_malformed_slug_returns_404(client):
    assert client.get("/api/products/Bad_Slug!").status_code == 404


def test_stale_offers_are_hidden_per_merchant_policy(client, db):
    amazon = db.scalar(select(Merchant).where(Merchant.slug == "amazon"))
    offer = db.scalar(select(Offer).where(Offer.external_product_id == "demo-amazon-northvale-mens-puffer-jacket"))
    original = offer.last_checked_at
    try:
        amazon.max_offer_age_hours = 24
        offer.last_checked_at = datetime.now(UTC) - timedelta(hours=48)
        db.commit()
        slugs = [o["merchant"]["slug"] for o in client.get("/api/products/northvale-mens-puffer-jacket").json()["offers"]]
        assert "amazon" not in slugs
    finally:
        amazon.max_offer_age_hours = None
        offer.last_checked_at = original
        db.commit()


def test_inactive_merchant_offers_are_hidden(client, db):
    myntra = db.scalar(select(Merchant).where(Merchant.slug == "myntra"))
    try:
        myntra.is_active = False
        db.commit()
        p = client.get("/api/products/northvale-mens-puffer-jacket").json()
        assert all(o["merchant"]["slug"] != "myntra" for o in p["offers"])
        assert all(m["slug"] != "myntra" for m in client.get("/api/merchants").json())
    finally:
        myntra.is_active = True
        db.commit()


def test_product_without_purchasable_offers_is_not_listed(client, db):
    product = db.scalar(select(Product).where(Product.slug == "driftline-unisex-high-top-sneakers"))
    (only_offer,) = product.offers
    try:
        only_offer.availability = "out_of_stock"
        db.commit()
        slugs = [p["slug"] for p in client.get("/api/products", params={"page_size": 60}).json()["items"]]
        assert product.slug not in slugs
        detail = client.get(f"/api/products/{product.slug}").json()
        assert detail["best_price"] is None and detail["offer_count"] == 0
    finally:
        only_offer.availability = "in_stock"
        db.commit()


def test_categories_with_counts(client):
    cats = client.get("/api/categories").json()
    assert [c["slug"] for c in cats] == ["jackets", "hoodies", "sweaters", "sweatshirts", "accessories", "footwear"]
    assert sum(c["product_count"] for c in cats) == 26
    assert next(c for c in cats if c["slug"] == "jackets")["product_count"] == 6


def test_merchants_expose_only_public_fields(client):
    merchants = client.get("/api/merchants").json()
    assert {m["slug"] for m in merchants} == {"amazon", "flipkart", "myntra"}
    assert set(merchants[0]) == {"slug", "name", "website_url", "affiliate_network"}


def test_prices_are_decimal_in_database(db):
    from decimal import Decimal

    offer = db.scalar(select(Offer).limit(1))
    assert isinstance(offer.price, Decimal)
