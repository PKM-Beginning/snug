"""Admin authentication, rate limiting, security headers and URL validation."""
import secrets
import threading
import time
from collections import defaultdict, deque
from urllib.parse import urlsplit

from fastapi import Header, Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import Settings, get_settings
from app.errors import AppError, error_json

# ---------------------------------------------------------------- admin auth


def require_admin(x_admin_key: str | None = Header(default=None, alias="X-Admin-Key")) -> None:
    """Protects /api/admin/*. Disabled (404) unless ADMIN_API_KEY is configured."""
    configured = get_settings().admin_api_key
    if configured is None or not configured.get_secret_value():
        raise AppError(404, "not_found", "Not found.")
    if not x_admin_key or not secrets.compare_digest(x_admin_key.encode(), configured.get_secret_value().encode()):
        raise AppError(401, "unauthorized", "A valid X-Admin-Key header is required.")


# ------------------------------------------------------------- rate limiting


class SlidingWindowLimiter:
    """In-memory, per-process limiter. For multiple workers/instances,
    replace with a shared store (e.g. Redis) — see README."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str, limit: int, window: float = 60.0) -> tuple[bool, int]:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > window:
                q.popleft()
            if len(q) >= limit:
                retry = int(window - (now - q[0])) + 1
                return False, retry
            q.append(now)
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


limiter = SlidingWindowLimiter()


def client_ip(request: Request, settings: Settings) -> str:
    if settings.trust_proxy_headers:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if not path.startswith("/api/") or path == "/api/health" or request.method == "OPTIONS":
            return await call_next(request)
        settings = get_settings()
        is_admin = path.startswith("/api/admin")
        limit = settings.admin_rate_limit_per_minute if is_admin else settings.rate_limit_per_minute
        key = f"{'admin' if is_admin else 'public'}:{client_ip(request, settings)}"
        ok, retry = limiter.allow(key, limit)
        if not ok:
            return error_json(429, "rate_limited", "Too many requests. Please slow down.", headers={"Retry-After": str(retry)})
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        if request.url.path.startswith("/api/admin"):
            response.headers["Cache-Control"] = "no-store"
        return response


# ------------------------------------------------------------ URL validation


class UnsafeUrlError(ValueError):
    pass


def validate_https_url(url: str, allowed_hosts: frozenset[str] | None = None, max_length: int = 2048) -> str:
    """Accept only absolute https URLs (optionally on an allow-listed host).

    allowed_hosts entries match the exact host or any subdomain of it.
    """
    if not isinstance(url, str) or not url or len(url) > max_length:
        raise UnsafeUrlError("URL is empty or too long")
    if any(c in url for c in ("\n", "\r", "\t", " ", "\\")):
        raise UnsafeUrlError("URL contains illegal characters")
    parts = urlsplit(url)
    if parts.scheme != "https" or not parts.hostname:
        raise UnsafeUrlError("Only absolute https URLs are allowed")
    if parts.username or parts.password:
        raise UnsafeUrlError("Credentials in URLs are not allowed")
    host = parts.hostname.lower()
    if allowed_hosts is not None and not any(host == h or host.endswith("." + h) for h in allowed_hosts):
        raise UnsafeUrlError(f"Host '{host}' is not allowed for this merchant")
    return url


def validate_image_url(url: str) -> str:
    """Images may be https URLs or site-relative paths under /images/."""
    if isinstance(url, str) and url.startswith("/images/") and ".." not in url and len(url) <= 512:
        return url
    return validate_https_url(url, max_length=1024)
