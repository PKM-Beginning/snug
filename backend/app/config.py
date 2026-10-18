"""Application settings, loaded from environment variables (or backend/.env)."""
from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: Literal["development", "test", "production"] = "development"
    # No credentials in code: set DATABASE_URL (see .env.example).
    database_url: str = "postgresql+psycopg://localhost:5432/snug"

    # Comma-separated list of allowed browser origins (the Next.js site).
    cors_origins: str = "http://localhost:3000"

    # Public, unauthenticated endpoints: requests per minute per client IP.
    rate_limit_per_minute: int = Field(default=120, ge=1)
    # Admin endpoints are rate-limited separately and more strictly.
    admin_rate_limit_per_minute: int = Field(default=10, ge=1)
    # Only trust X-Forwarded-For when running behind a known reverse proxy.
    trust_proxy_headers: bool = False

    # Admin/sync endpoints are disabled entirely unless this is set.
    admin_api_key: SecretStr | None = None

    # Rating data is only filterable when it comes from a source listed here.
    # Demo seed ratings use the source "demo"; never list "demo" in production.
    reliable_rating_sources: str = ""

    # Marketplace credentials — server-side only, never sent to the frontend.
    amazon_paapi_access_key: SecretStr | None = None
    amazon_paapi_secret_key: SecretStr | None = None
    amazon_partner_tag: str | None = None
    flipkart_affiliate_id: str | None = None
    flipkart_affiliate_token: SecretStr | None = None
    myntra_affiliate_id: str | None = None
    myntra_affiliate_token: SecretStr | None = None

    @field_validator("database_url")
    @classmethod
    def _normalise_db_url(cls, v: str) -> str:
        # Accept plain postgres URLs and route them to the psycopg 3 driver.
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://") :]
        if v.startswith("postgresql://"):
            v = "postgresql+psycopg://" + v[len("postgresql://") :]
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]

    @property
    def reliable_rating_source_set(self) -> set[str]:
        return {s.strip() for s in self.reliable_rating_sources.split(",") if s.strip()}

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
