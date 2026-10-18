from app.config import Settings
from app.providers.amazon import AmazonProvider
from app.providers.base import MarketplaceProvider
from app.providers.flipkart import FlipkartProvider
from app.providers.myntra import MyntraProvider

PROVIDERS: dict[str, type[MarketplaceProvider]] = {
    AmazonProvider.slug: AmazonProvider,
    FlipkartProvider.slug: FlipkartProvider,
    MyntraProvider.slug: MyntraProvider,
}


def get_provider(slug: str, settings: Settings) -> MarketplaceProvider | None:
    cls = PROVIDERS.get(slug)
    return cls(settings) if cls else None
