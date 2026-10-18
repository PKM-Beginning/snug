"""Myntra — via whichever official affiliate programme/network is approved.

Not connected. Myntra offers are typically distributed through an affiliate
network; the network and its feed format must be confirmed before Phase 3.
No scraping; affiliate links are passed through exactly as issued.
"""
from collections.abc import Mapping
from typing import Any

from app.providers.base import SyncPolicy, UnconfiguredProvider


class MyntraProvider(UnconfiguredProvider):
    slug = "myntra"
    name = "Myntra"
    website_url = "https://www.myntra.com"
    affiliate_network = "To be confirmed"
    # Add the approved network's tracking domain here once confirmed.
    allowed_affiliate_hosts = frozenset({"myntra.com"})
    credential_settings = ("myntra_affiliate_id", "myntra_affiliate_token")
    default_policy = SyncPolicy()  # set from the programme's terms before enabling

    def map_record(self, raw: Mapping[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Map the approved Myntra feed fields here in Phase 3.")
