# Snug — Stay Warm. Spend Less.

Winter fashion deal discovery. Compare offers across marketplaces, then buy on the original store.

> **Demo build:** all products, brands, prices and offers are mock data. No marketplace APIs are connected and no affiliate links are real.

## Frontend (Next.js)

```powershell
npm.cmd install
copy .env.example .env.local
npm.cmd run dev          # http://localhost:3000
npm.cmd run build; npm.cmd start
```
(On macOS/Linux, or after `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, plain `npm` works.)

Requires Node 18.18+ and internet access at build time (Google Fonts via `next/font`).

### Data source flag (`.env.local`)

| `NEXT_PUBLIC_USE_LIVE_API` | Products come from | Backend needed |
|---|---|---|
| `false` (default) | built-in mock catalogue | no |
| `true` | FastAPI backend at `API_BASE_URL` | yes |

In live mode, if the backend is unreachable the site shows a "Live prices are unavailable" screen. It never falls back to demo data.

## Deploying the preview to Vercel (frontend only)

1. Push to GitHub, then **Vercel → Add New → Project → Import** the repo. Vercel detects Next.js; leave the root directory as the repo root.
2. Environment variables (Production):
   - `NEXT_PUBLIC_USE_LIVE_API` = `false`. This is also the default when unset.
   - `NEXT_PUBLIC_SITE_URL` is optional. Set it once you attach a custom domain.
   - Leave `ALLOW_INDEXING` unset, so search engines are blocked while the site shows demo data.
3. Deploy. `backend/` is excluded via `.vercelignore` and is not deployed.

In preview mode, the site shows a "Preview" banner on every page, ratings are tagged "Demo", Buy buttons are disabled, and the legal pages are interim notices.

## Backend (FastAPI + PostgreSQL)

See **[backend/README.md](backend/README.md)** for Windows setup, commands and API reference.

## Where things live

- `src/lib/catalog.ts` is the only data entry point pages use. It picks the mock or live provider from the flag.
- `src/lib/api/` is the typed client for the FastAPI backend, plus mappers to the UI's `Product` type.
- `src/lib/marketplaces/` holds the frontend providers (`mockProvider`, `liveApiProvider`).
- `src/lib/filters.ts` holds the search, filter and sort logic.
- `npm run images:check` lists the photos still missing; `npm run placeholders` regenerates the SVG placeholders.
