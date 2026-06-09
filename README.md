# Trove — Personal Media Catalog

A private, single-user web catalog of **owned** media — Movies, TV, and Games —
that answers one question fast: *"what do I own, and where can I open it?"*
Ownership, not streaming availability.

Built from the v0.2 PRD and the hi-fi design handoff. Stack: **Next.js (App
Router) + TypeScript + Tailwind**, deployed to **Cloudflare** via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), data in
**Cloudflare D1**. Metadata + cover art come from **TMDB** (movies/TV) and
**RAWG** (games), fetched from an ID you paste and cached into D1.

## Features

- Launchpad with live counts + keyboard-first global search across all catalogs.
- Three catalogs (Movies / TV / Games) with cover art, sort, filter, and search
  — all state lives in the URL (refresh-safe, shareable deep links).
- Detail views: movie "where I own it" (digital lockers + physical formats),
  game ownership grouped by service, and the TV **season grid** (multi-platform
  per season, All/Specific episodes).
- Paste-an-ID add/edit flow: paste a TMDB/RAWG URL or bare id → live fetch →
  preview → set ownership → save. Plus delete (focus-trapped confirm dialog).
- Status semantics kept distinct from the rose action accent: amber
  `needs_review` (movies), indigo `Untagged` (games, floats to top, 2-click tag).

## Project layout

```
src/app/            routes (launchpad, /movies /tv /games + [id] + /new, /api/*)
src/components/      UI primitives (ui/) + composed views and editors (detail/)
src/lib/            db access, queries, mutations, catalog filters, tmdb/rawg, platforms
db/migrations/      0001_init.sql (D1 schema)
db/seed/            seed JSON (generated) consumed by the seeder
scripts/            build-seed.ts (data.js -> seed JSON), seed.ts (-> D1)
public/logos/       brand/format logos used by the ownership marks
```

Data flow: **reads** (lists/details/counts/search) are React Server Components
querying D1 directly; **writes + metadata fetch** are route handlers under
`src/app/api/*` called from the client editors.

## Local development

```bash
npm install

# one-time: build seed JSON from the prototype sample, then create + seed local D1
npm run build:seed
npm run db:reset:local      # apply db/migrations/0001_init.sql to local D1
npm run db:seed:local       # load db/seed/*.json into local D1

npm run dev                 # http://localhost:3000 (next dev, local D1 binding)
```

For the production runtime locally (workerd + local D1):

```bash
npm run preview             # opennextjs-cloudflare build + preview
```

### Metadata API keys

Re-fetch / add flows call TMDB and RAWG. Copy `.dev.vars.example` to `.dev.vars`
and fill in:

```
TMDB_API_KEY=...   # https://www.themoviedb.org/settings/api
RAWG_API_KEY=...   # https://rawg.io/apidocs
```

Without keys the app still runs from seeded data; only live fetch is disabled
(endpoints return a clear "not configured" error).

## Seeding real data later

The importer is data-source-agnostic. When the real data (Excel) is ready,
regenerate `db/seed/{movies,tv,games}.json` in the same shape (see
`scripts/build-seed.ts` for the exact fields) and run the seed scripts again.
`games.platforms` is a JSON array of `{service, format}` and TV seasons carry
`episodes` (`"all" | "unowned" | number[]`) + `owned_on` (string array).

## Cloudflare deployment (owner steps)

The D1 database `trove` is already provisioned (its `database_id` is wired into
`wrangler.jsonc`). To deploy:

1. **Authenticate** wrangler: `npx wrangler login`.
2. **Apply schema + seed to remote** (already done once; re-run to reset):
   `npm run db:reset:remote && npm run db:seed:remote`.
3. **Set secrets**: `npx wrangler secret put TMDB_API_KEY` and `RAWG_API_KEY`.
4. **Deploy**: `npm run deploy` (or connect the GitHub repo to Cloudflare).
5. **Auth**: put the whole subdomain (`trove.joshmuthumani.com`) behind
   **Cloudflare Access** — there is no app-level login by design.
