# Snug API (backend)

FastAPI + PostgreSQL + SQLAlchemy 2.0 + Alembic. Serves the winter-fashion
catalogue and offer comparison to the Next.js frontend.

> **Demo data only.** No marketplace APIs are connected. The seed script loads
> the same mock catalogue as the frontend, flagged `is_demo = true`, with
> empty affiliate URLs.

## Windows setup (PowerShell)

### 1. Prerequisites
- **Python 3.11+** (3.12 recommended), from python.org. Tick *"Add python.exe to PATH"*.
- **PostgreSQL 15+**, from postgresql.org (Windows installer). Remember the `postgres` password you set.

If PowerShell blocks scripts (`Activate.ps1 cannot be loaded`), run this once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 2. Create the database
Open **SQL Shell (psql)** from the Start menu, log in as `postgres`, then run:
```sql
CREATE ROLE snug WITH LOGIN PASSWORD 'change-me';
CREATE DATABASE snug OWNER snug;
\q
```

### 3. Install and configure
```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
copy .env.example .env
```
Edit `backend\.env` and set `DATABASE_URL` to match the password above.

### 4. Create tables, load demo data, run
```powershell
python -m alembic upgrade head
python -m app.seed
python -m uvicorn app.main:app --reload --port 8000
```
- API: http://localhost:8000/api/products
- Interactive docs (development only): http://localhost:8000/docs

### 5. Connect the frontend
In the project root (a second terminal):
```powershell
copy .env.example .env.local
# edit .env.local:  NEXT_PUBLIC_USE_LIVE_API=true
npm.cmd run dev
```
Restart `npm run dev` whenever you change `.env.local`.

### 6. Run the tests
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m pytest
```
The tests use a temporary SQLite database, so they don't need PostgreSQL running.

## Command reference

| Task | Command (in `backend\`, venv active) |
|---|---|
| Apply migrations | `python -m alembic upgrade head` |
| Roll back all | `python -m alembic downgrade base` |
| New migration after model changes | `python -m alembic revision --autogenerate -m "describe change"` |
| Load or refresh demo data | `python -m app.seed` |
| Replace demo data | `python -m app.seed --reset` |
| Start the API | `python -m uvicorn app.main:app --reload --port 8000` |
| Tests | `python -m pytest` |

## API

| Endpoint | Notes |
|---|---|
| `GET /api/products` | Filters, sort, pagination; optional `q` |
| `GET /api/products/{slug}` | Detail + offer comparison + images; 404 if unknown |
| `GET /api/search?q=` | Same filters as products; `q` required |
| `GET /api/deals` | `type=discount` (default ≥ 50% off) or `type=price_gap` |
| `GET /api/categories` | With product counts |
| `GET /api/merchants` | Active merchants (public fields only) |
| `GET /api/health` | Database check |

**Filters:**
- `category` and `gender` take comma-separated values, e.g. `category=jackets,hoodies`.
- `merchant` takes comma-separated slugs.
- `min_price` and `max_price` set a price range.
- `min_discount` sets a minimum % off.
- `min_rating` only works once a reliable rating source is configured (see *Decisions* below). Until then it returns a 400 with code `rating_filter_unavailable`.

**Sorting:** `sort=recommended | price_asc | discount_desc | newest`.

**Pagination:** `page` and `page_size` (max 60). Responses look like `{items, page, page_size, total, total_pages}`.

**Errors:** always returned as `{"error": {"code", "message", "details?"}}`. Codes used: 400, 401, 404, 409, 422, 429, 500, 503.

**Admin:**
- Endpoints: `GET /api/admin/sync-jobs` and `POST /api/admin/merchants/{slug}/sync`.
- They need the `X-Admin-Key` header and return 404 until `ADMIN_API_KEY` is set.
- They are hidden from the OpenAPI docs and more strictly rate-limited.

## Architecture

```
backend/app/
  config.py          settings from env / .env
  models.py          Product, Merchant, Offer, ProductImage, SyncJob
  schemas.py         response models
  services/catalog.py  filtering, sorting, pagination, offer comparison
  services/sync.py   SyncJob runner + product/offer upsert
  providers/         MarketplaceProvider base + amazon/flipkart/myntra stubs
  routers/           catalog (public) and admin (protected)
  security.py        admin auth, rate limiting, headers, URL validation
  seed.py            demo data loader
alembic/versions/    migrations
tests/               pytest suite
```

### Decisions
- **Money:**
  - Prices are `NUMERIC(10,2)` in Postgres and `Decimal` in Python.
  - JSON responses send them as numbers for display.
  - Discounts use the *lowest* MRP among purchasable offers, so they're never overstated.
- **Purchasable offers:**
  - An offer counts as purchasable only when it's in stock, its merchant is active, and it's newer than the merchant's `max_offer_age_hours`.
  - Stale offers are hidden rather than shown with an old price.
- **Ratings:**
  - Stored with a `rating_source`. Seed ratings are tagged `demo`.
  - `min_rating` filtering only uses sources listed in `RELIABLE_RATING_SOURCES`, so it is off by default.
  - "Recommended" sorting ignores ratings.
- **Per-merchant policy:** `sync_interval_minutes`, `offer_cache_ttl_seconds` and `max_offer_age_hours` sit on each merchant row, with defaults in each provider. All are left unset. Fill them in from each affiliate agreement — they are not guessed here.
- **Providers:**
  - Each provider only maps official API or feed fields and passes affiliate links through unchanged.
  - Links are validated: https only, and the host must be on that merchant's allowlist.
  - No scraping, no price history, no price alerts.
- **Rate limiting:** in memory, per process. If you run several workers or instances, switch to a shared store such as Redis.
- **Vocabulary columns:** stored as `VARCHAR` with `CHECK` constraints rather than native enums, so adding a value later is a simple migration.
