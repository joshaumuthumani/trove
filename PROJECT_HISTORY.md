# Project History

A chronological record of the significant code changes made to **Trove** — a
private, single-user catalog of owned Movies, TV, and Games that answers "what
do I own, and where can I open it?"

This file is a human-readable narrative of the work, grouped into phases. It
complements (does not replace) the git log. Commit hashes link to GitHub.

> Maintenance: add a new entry under the right phase (or a new phase) whenever a
> change lands on `main`. Keep entries short — what changed and why, not a diff.

Repo: <https://github.com/joshaumuthumani/trove> · Production branch: `main`
(auto-deploys to Cloudflare Workers via Workers Builds).

---

## Phase 1 — Foundation

### Scaffold Trove: Next.js + Cloudflare D1 personal media catalog (P0+P1)
[`3879457`](https://github.com/joshaumuthumani/trove/commit/3879457) · 2026-06-09

Initial build from the v0.2 PRD and the hi-fi design handoff.

- **Stack:** Next.js (App Router) + TypeScript + Tailwind, deployed via
  `@opennextjs/cloudflare`. Cloudflare D1 (binding `DB`) wired in
  `wrangler.jsonc`; schema in `db/migrations/0001_init.sql`.
- **Data flow:** reads = React Server Components querying D1; writes + TMDB/RAWG
  metadata fetch = route handlers under `src/app/api/*`. Art URLs cached into D1.
- **UI (ported from the prototype):** prototype CSS ported verbatim into
  `globals.css`; launchpad with counts + keyboard-first global search;
  Movies/TV/Games catalogs with cover art, URL-driven sort/filter/search, and
  density toggle; detail views (movie digital/physical groups, game ownership
  grouped by service, multi-platform TV season grid); paste-an-ID add/edit flow
  with live preview; focus-trapped delete.
- **Ownership marks:** service logo tiles vs. physical format pills; status hues
  (`needs_review` / `Untagged`) kept distinct from the rose action accent.
- **Seeding:** `build-seed.ts` + `seed.ts` transform the prototype sample into
  `db/seed/*.json` and load D1 (local + remote).
- **Schema note** (design README supersedes PRD): games store ownership as a
  JSON `platforms` array (multi-platform); games/tv_series carry `year`,
  tv_series carries `note`.

_92 files, ~19.8k insertions._

---

## Phase 2 — Metadata IDs & fetch flow

### Fix media id extraction for TMDB/RAWG slug URLs
[`cb6e061`](https://github.com/joshaumuthumani/trove/commit/cb6e061) · 2026-06-09

`extractTrailingId` grabbed the last number in the input, but TMDB canonical
URLs are `/<id>-<slug>` — and when the slug is itself numeric (e.g.
`/movie/530915-1917`) it returned the slug instead of the real id. Renamed to
`extractMediaId`: parse the id from the `/movie|tv|game(s)/` path segment first,
then the leading number of a bare id-slug, then any number. Applied to the TMDB
+ RAWG route handlers.

### Add RAWG name-search with results picker for games
[`10cd872`](https://github.com/joshaumuthumani/trove/commit/10cd872) · 2026-06-09

RAWG has no paste-able numeric id; games are discovered by name. Re-fetch now
searches RAWG by the current title — a single hit applies directly, multiple
hits open a `RawgPicker` modal to confirm which game (pulling year + cover art).
Pasting a RAWG id/slug/URL still does a direct fetch. Adds `searchRawgGames()`,
a search mode on the RAWG route, and the `searchRawg()` client helper.

### Accept RAWG slug URLs and show live metadata preview on Re-fetch
[`de7d94b`](https://github.com/joshaumuthumani/trove/commit/de7d94b) · 2026-06-09

Two fixes from detail-page testing:
- RAWG slug URLs (`rawg.io/games/<slug>`) have no numeric id, so `extractMediaId`
  returned null. Added `extractRawgRef` to pull the `/games/<ref>` slug (or id),
  which the RAWG API accepts either way.
- The detail hero was bound to the saved record, so a successful Re-fetch staged
  new metadata but nothing changed on screen until Save. Bind the hero to the
  staged edit state so re-fetched art/title/year preview immediately.

---

## Phase 3 — Security hardening

### Security hardening from vulnerability review
[`032e1b1`](https://github.com/joshaumuthumani/trove/commit/032e1b1) · 2026-06-09

- Sanitize TMDB/RAWG metadata route errors (no longer leak missing-key /
  upstream-status text to clients).
- `safeImageUrl()` allows only https TMDB/RAWG image hosts for stored art URLs
  (rendered into raw `<img>`).
- Validate platform enums against the `platforms.ts` vocabulary; drop unknowns.
- Security headers + CSP in `next.config.ts` (img-src locked to the art CDNs,
  `frame-ancestors none`, nosniff, HSTS, Referrer-Policy).
- Constrain RAWG ref to a slug/id charset and `encodeURIComponent` the RAWG/TMDB
  path ids (path-traversal defense).
- Harden `deleteRow` to fixed per-table statements with a runtime guard.
- Same-origin guard on all POST/PATCH/DELETE handlers (CSRF defense-in-depth,
  redundant with Cloudflare Access).
- Everything documented in `SECURITY.md`. No app-level auth by design —
  Cloudflare Access gates the app.

### Record deploy, secrets, security & metadata-id conventions in project notes
[`966e92a`](https://github.com/joshaumuthumani/trove/commit/966e92a) · 2026-06-09

Captured the deploy pipeline (Workers, not Pages), secret handling, security
findings, and metadata-id conventions in `CLAUDE.md`.

---

## Phase 4 — Real catalog data

### Load real Movies + TV catalog from owner's spreadsheet
[`562b0f6`](https://github.com/joshaumuthumani/trove/commit/562b0f6) · 2026-06-09

Replaced the prototype sample for Movies and TV with the owner's real catalog
imported from "Josh's Movie List.xlsx" (863 movies, 241 series / 384 seasons);
games untouched.

- Added `scripts/import-movie-list.py`: re-runnable importer mapping the sheet's
  ownership columns onto the app vocabulary (iTunes → Apple TV, VUDU → Fandango
  at Home), dropping the defunct "Microsoft Movies" locker, grouping season rows
  per series, and repairing a Sheets-mangled episode cell. Imported titles are
  flagged `needs_review` (no TMDB ids/posters/years yet).
- Regenerated `db/seed/{movies,tv}.json`; committed the source xlsx under
  `db/source/` for traceability.
- Fixed `scripts/seed.ts`: dropped explicit `BEGIN TRANSACTION`/`COMMIT` —
  remote D1 rejects SQL transaction statements over the HTTP API and
  `wrangler d1 execute --file` already applies atomically. Unblocks
  `db:seed:remote`.

---

## Phase 5 — UX & metadata refinements

### Cascade Movies Anywhere selection to all digital lockers
[`c3fbc29`](https://github.com/joshaumuthumani/trove/commit/c3fbc29) · 2026-06-09

Movies Anywhere is an aggregator: owning a title there means it's available on
every participating locker. Checking it now auto-selects all digital lockers
(unchecking clears them). The relationship is one-way — selecting another locker
never flips Movies Anywhere. Added `toggleDigital()` in `platforms.ts`, wired
into the movie editor and add-flow.

### Persist catalog filters/sort across detail navigation
[`c7e4b36`](https://github.com/joshaumuthumani/trove/commit/c7e4b36) · 2026-06-09

Opening an item and returning reset the catalog's filters/sort because the row
link and detail back-link dropped the URL query holding that state. Now the
query is carried through both, returning to the same filtered/sorted list;
detail URLs are also shareable with their list context.

### Add Director, User Score & Overview metadata from TMDB
[`1483730`](https://github.com/joshaumuthumani/trove/commit/1483730) · 2026-06-09

New synced-from-TMDB fields on movies and tv_series: `director` (movies =
credits crew; TV = creators, labeled "Created by"), `user_score`
(`vote_average`, 0–10, null when no votes), and `overview`. Populated by the
Re-fetch and add flows, persisted on save, shown read-only in the detail view.
Additive migration `0002_add_metadata_fields.sql` applies the columns without a
drop-and-recreate.

### Show Director and User Score columns in Movies/TV list view
[`365c23b`](https://github.com/joshaumuthumani/trove/commit/365c23b) · 2026-06-09

Added Director / Created-by and Score columns to the Movies and TV catalog
tables (games unchanged). Overview stays in the detail view only. Widened the
grid templates (movies 6 cols, tv 7 cols) at both densities; columns hidden on
the mobile breakpoint.

---

## Phase 6 — Bug fixes & maintenance

### Fix catalog search input lag and season/platform layout overlap
[`6a04c5c`](https://github.com/joshaumuthumani/trove/commit/6a04c5c) · 2026-06-10

- **Search:** the Movies/TV catalog search box was a controlled input bound to
  the server-synced URL param, calling `router.replace()` per keystroke. Fast
  leading characters were clobbered when React re-rendered from the stale param,
  and the visible value only updated after each RSC round-trip. Now driven by
  local state (instant), with the URL write debounced (150ms) inside a
  transition and external URL changes synced via a `lastPushed` ref — matching
  the global-search pattern.
- **Layout:** the All/Specific segmented control was hard-pinned to `width:200px`
  inside the season row's collapsible `minmax(0,1fr)` grid column, so in the
  constrained add-flow it overflowed onto the platform column. Changed to
  `width:100%` with a `200px` cap so it fits its cell. Verified in-browser at
  desktop (clean 12px gutter) and narrow (stacks vertically).

### Remove discontinued Xbox Video as a TV platform
[`7abe3b5`](https://github.com/joshaumuthumani/trove/commit/7abe3b5) · 2026-06-10

Xbox Video (Microsoft's TV/movie store) has been discontinued, so it was
dropped from the selectable TV platform vocabulary — same treatment as the
defunct "Microsoft Movies" locker. Removed from `TV_PLATFORMS` and its
`PLATFORMS`/`SERVICE_LOGO` entries (the "Xbox" game *service* is unaffected),
mapped to `None` in the importer (`TV_ORDER`) so a re-import won't reintroduce
it, and stripped from the seed's 11 affected seasons (9 had it as their only
platform → owned-but-source-unspecified; all stay owned). Live D1 cleaned via a
JSON-aware `UPDATE` on `tv_seasons.owned_on` (local 11→0, production 9→0; the
prod catalog has diverged from the seed through in-app edits, so a targeted
update was used rather than a re-seed).
