"""Amazon India — via the official Amazon Associates Product Advertising API.

Not connected. Phase 3 will implement fetch_eligible_products() and
map_record() against the official API using the credentials below.

Scope notes for this project:
- No scraping.
- Affiliate links are taken verbatim from API responses (never constructed).
- No historical price tracking and no price-drop alerts.
- Display/caching limits must follow the current Associates programme
  policies; configure them via the merchant's policy columns.
"""
from collections.abc import Mapping
from typing import Any

from app.providers.base import SyncPolicy, UnconfiguredProvider


class AmazonProvider(UnconfiguredProvider):
    slug = "amazon"
    name = "Amazon"
    website_url = "https://www.amazon.in"
    affiliate_network = "Amazon Associates"
    allowed_affiliate_hosts = frozenset({"amazon.in", "amzn.to"})
    credential_settings = ("amazon_paapi_access_key", "amazon_paapi_secret_key", "amazon_partner_tag")
    default_policy = SyncPolicy()  # set from the programme's terms before enabling

    def map_record(self, raw: Mapping[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Map Product Advertising API fields here in Phase 3.")
