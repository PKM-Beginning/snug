from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select

from app.models import Product


def items(client, path="/api/products", **params):
    params.setdefault("page_size", 60)
    r = client.get(path, params=params)
    assert r.status_code == 200, r.text
    return r.json()["items"]


# ------------------------------------------------------------------ filters


def test_filter_by_category(client):
    result = items(client, category="footwear")
    assert len(result) == 4 and all(p["category"] == "footwear" for p in result)


def test_filter_by_multiple_categories(client):
    result = items(client, category="jackets,hoodies")
    assert len(result) == 10 and {p["category"] for p in result} == {"jackets", "hoodies"}


def test_filter_by_gender(client):
    result = items(client, gender="men")
    assert len(result) == 9 and all(p["gender"] == "men" for p in result)


def test_filter_by_price_range(client):
    result = items(client, min_price=500, max_price=999)
    assert result and all(500 <= p["best_price"] <= 999 for p in result)


def test_filter_by_merchant(client):
    result = items(client, merchant="myntra")
    assert result
    for p in result:
        assert any(o["merchant"]["slug"] == "myntra" and o["availability"] != "out_of_stock" for o in p["offers"])
    # Products whose only Myntra offer is out of stock are excluded.
    assert "northvale-thermal-set" not in {p["slug"] for p in result}


def test_filter_by_discount(client):
    result = items(client, min_discount=58)
    assert result and all(p["discount_percent"] >= 58 for p in result)


def test_combined_filters(client):
    result = items(client, category="jackets", gender="women", max_price=2000)
    assert [p["slug"] for p in result] == ["kestrel-womens-cropped-puffer"]


def test_search_endpoint(client):
    result = items(client, "/api/search", q="hoodie")
    assert len(result) == 4 and all("hoodie" in p["title"].lower() for p in result)


def test_search_matches_brand_and_combines_with_filters(client):
    assert {p["brand"] for p in items(client, "/api/search", q="northvale")} == {"Northvale"}
    result = items(client, "/api/search", q="jacket", gender="kids")
    assert [p["slug"] for p in result] == ["alpine-row-kids-hooded-jacket"]


def test_search_with_no_results(client):
    r = client.get("/api/search", params={"q": "zzzzqqq"})
    assert r.status_code == 200 and r.json()["total"] == 0 and r.json()["total_pages"] == 0


def test_rating_filter_disabled_without_reliable_source(client):
    r = client.get("/api/products", params={"min_rating": 4})
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "rating_filter_unavailable"


def test_rating_filter_when_source_is_trusted(client, env):
    env(reliable_rating_sources="demo")  # development only
    result = items(client, min_rating=4.5)
    assert result and all(p["rating"] >= 4.5 for p in result)


# ------------------------------------------------------------------ sorting


def test_sort_lowest_price(client):
    prices = [p["best_price"] for p in items(client, sort="price_asc")]
    assert prices == sorted(prices) and prices[0] == 199.0


def test_sort_highest_discount(client):
    discounts = [p["discount_percent"] for p in items(client, sort="discount_desc")]
    assert discounts == sorted(discounts, reverse=True)


def test_sort_newest(client, db):
    product = db.scalar(select(Product).where(Product.slug == "hearth-womens-cardigan"))
    original = product.created_at
    try:
        product.created_at = datetime.now(UTC) + timedelta(days=1)
        db.commit()
        assert items(client, sort="newest")[0]["slug"] == "hearth-womens-cardigan"
    finally:
        product.created_at = original
        db.commit()


def test_sort_recommended_prefers_winter_score_and_discount(client):
    result = items(client, sort="recommended")
    scores = [p["winter_score"] * 0.6 + p["discount_percent"] * 0.4 for p in result]
    # Integer-rounded discounts in the response can differ slightly from the
    # exact SQL value, so allow a small tolerance.
    assert all(a >= b - 0.5 for a, b in zip(scores, scores[1:]))


def test_default_sort_is_recommended(client):
    assert items(client) == items(client, sort="recommended")


# ------------------------------------------------------------------ deals


def test_deals_default_to_big_discounts(client):
    result = items(client, "/api/deals")
    assert result and all(p["discount_percent"] >= 50 for p in result)
    discounts = [p["discount_percent"] for p in result]
    assert discounts == sorted(discounts, reverse=True)


def test_price_gap_deals(client):
    result = items(client, "/api/deals", type="price_gap")
    assert result and all(p["offer_count"] >= 2 for p in result)

    def spread(p):
        prices = [o["price"] for o in p["offers"] if o["availability"] != "out_of_stock"]
        return max(prices) - min(prices)

    spreads = [spread(p) for p in result]
    assert spreads == sorted(spreads, reverse=True)
    assert result[0]["slug"] == "northvale-mens-puffer-jacket"


# ------------------------------------------------------------ invalid input


@pytest.mark.parametrize(
    "params, field",
    [
        ({"page": 0}, "page"),
        ({"page_size": 61}, "page_size"),
        ({"min_price": -1}, "min_price"),
        ({"min_price": 900, "max_price": 100}, "min_price"),
        ({"min_discount": 101}, "min_discount"),
        ({"sort": "cheapest"}, "sort"),
        ({"category": "boots"}, "category"),
        ({"gender": "aliens"}, "gender"),
        ({"merchant": "not a slug"}, "merchant"),
        ({"q": "x" * 81}, "q"),
        ({"min_price": "abc"}, "min_price"),
    ],
)
def test_invalid_inputs_return_structured_422(client, params, field):
    r = client.get("/api/products", params=params)
    assert r.status_code == 422, r.text
    err = r.json()["error"]
    assert err["code"] == "validation_error"
    assert any(d["field"] == field for d in err["details"])


def test_search_requires_query(client):
    assert client.get("/api/search").status_code == 422
    r = client.get("/api/search", params={"q": "   "})
    assert r.status_code == 422 and r.json()["error"]["details"][0]["field"] == "q"


def test_invalid_deal_type(client):
    assert client.get("/api/deals", params={"type": "free"}).status_code == 422


def test_unknown_route_is_structured(client):
    r = client.get("/api/nothing-here")
    assert r.status_code == 404 and r.json()["error"]["code"] == "not_found"
