"""Fixed vocabularies shared by models, schemas and the API."""
from enum import StrEnum


class Category(StrEnum):
    jackets = "jackets"
    hoodies = "hoodies"
    sweaters = "sweaters"
    sweatshirts = "sweatshirts"
    accessories = "accessories"
    footwear = "footwear"


class Gender(StrEnum):
    men = "men"
    women = "women"
    kids = "kids"
    unisex = "unisex"


class Availability(StrEnum):
    in_stock = "in_stock"
    low_stock = "low_stock"
    out_of_stock = "out_of_stock"


class SyncStatus(StrEnum):
    pending = "pending"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"


class SortOption(StrEnum):
    recommended = "recommended"
    price_asc = "price_asc"
    discount_desc = "discount_desc"
    newest = "newest"


CATEGORY_INFO: dict[Category, dict[str, str]] = {
    Category.jackets: {"name": "Jackets", "description": "Puffers, bombers and parkas built for real cold."},
    Category.hoodies: {"name": "Hoodies", "description": "Fleece-lined everyday layers."},
    Category.sweaters: {"name": "Sweaters", "description": "Knits, cardigans and turtlenecks."},
    Category.sweatshirts: {"name": "Sweatshirts", "description": "Crewnecks and pullovers for easy layering."},
    Category.accessories: {"name": "Winter Accessories", "description": "Beanies, scarves, gloves and thermals."},
    Category.footwear: {"name": "Winter Footwear", "description": "Boots and warm-lined sneakers."},
}


def sql_in(values: type[StrEnum]) -> str:
    """Render an enum as a SQL IN-list for CHECK constraints."""
    return ", ".join(f"'{v.value}'" for v in values)
