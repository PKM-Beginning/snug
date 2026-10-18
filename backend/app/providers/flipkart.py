"""Flipkart — via the official Flipkart Affiliate API / product feeds.

Not connected. Phase 3 will implement fetch_eligible_products() and
map_record() against the official affiliate API. No scraping; affiliate
links are passed through exactly as issued by the programme.
"""
from collections.abc import Mapping
from typing import Any

from app.providers.base import SyncPolicy, UnconfiguredProvider


class FlipkartProvider(UnconfiguredProvider):
    slug = "flipkart"
    name = "Flipkart"
    website_url = "https://www.flipkart.com"
    affiliate_network = "Flipkart Affiliate"
    allowed_affiliate_hosts = frozenset({"flipkart.com"})
    credential_settings = ("flipkart_affiliate_id", "flipkart_affiliate_token")
    default_policy = SyncPolicy()  # set from the programme's terms before enabling

    def map_record(self, raw: Mapping[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Map Flipkart Affiliate API fields here in Phase 3.")
