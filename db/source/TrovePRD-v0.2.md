# Trove — Personal Media Catalog
### PRD v0.2 (draft)

**Owner:** Josh
**Status:** Draft — decisions locked, ready for P0 build
**Date:** June 2026
**Name:** "Trove" is a placeholder — swap if something better lands.

**Changes since v0.1:** Dropped all title-matching logic in favor of paste-an-ID metadata. Added the TV season-grid entry flow. Locked Games metadata to RAWG. Added a one-time movie backfill (reviewable). Added real deep-linkable routing (`/movies/{id}`) and locked the framework to Next.js App Router. *(v0.2 patch: added `/{catalog}/new` add routes + the **+ Add** button entry point.)*

---

## 1. What we're building

A private, web-based catalog of everything I already own across **Movies, TV, and Games** — replacing three aging spreadsheets. One launchpad page, then three sortable/filterable catalogs. The whole point is fast answers to two questions:

- *"I want to watch this — which of my services already has it?"* (Movies/TV)
- *"Is this already in my library so I don't buy it twice?"* (Games)

Behind Cloudflare Access on a subdomain of my personal domain. Single user (me). Writable in the browser.

**Not WatchAtlas.** WatchAtlas answers "what's streaming right now." Trove answers "what do *I* own, and where." Ownership, not availability.

---

## 2. Goals

- Replace all three spreadsheets as the single source of truth for owned media.
- Find any title and its where-to-open info in **under 5 seconds**.
- Add or edit an entry in the browser — no spreadsheet, no redeploy.
- Visual (cover art) without losing scan-a-table speed.
- Every view is a real, refresh-safe URL.

## 3. Non-Goals (v1)

- **No live streaming availability** (that's WatchAtlas).
- **No watch/play progress tracking** (Trakt owns that).
- **No multi-user / sharing / public access.**
- **No price tracking, wishlist, or "want to buy."** Owned items only. (Parking lot.)
- **No fuzzy title-matching.** Metadata comes from an ID I supply, not a guess.
- **No native mobile app.** Responsive web is enough.

---

## 4. Architecture & Stack

- **Framework:** **Next.js (App Router) + Tailwind + shadcn/ui** — consistent with FlowDesk, and its file-based routing gives refresh-safe deep links for free (see §5).
- **Hosting:** Cloudflare Pages at `trove.joshmuthumani.com`.
- **API:** Pages Functions / route handlers for read/write.
- **Database:** Cloudflare D1 (SQLite).
- **Auth:** Cloudflare Access over the whole subdomain. If you can reach it, you're me — no app-level login, writes ride the same gate.
- **Source/CI:** GitHub → Pages.
- **Metadata & art:** TMDB for Movies + TV (reuse WatchAtlas integration), RAWG for Games. All metadata is fetched from an **ID I paste** — no matching logic in the live app. Art URLs cached to D1 so we never hit the APIs on a normal page load.

---

## 5. Routing & URLs

Every view has its own real URL; a refresh or a pasted link lands exactly there — no bouncing to home. (Prior builds bounced because "where am I" lived in memory, not the URL.)

| Route | View |
|---|---|
| `/` | Launchpad |
| `/movies` | Movies catalog (filters/sort/search in query params) |
| `/movies/{id}` | Movie detail |
| `/movies/new` | Add a movie (paste TMDB ID) |
| `/tv` | TV catalog |
| `/tv/{id}` | Series detail (season grid) |
| `/tv/new` | Add a series (paste series TMDB ID) |
| `/games` | Games catalog |
| `/games/{id}` | Game detail |
| `/games/new` | Add a game (paste RAWG ID) |

- `{id}` = internal D1 row id — stable, consistent across all three. (Optional readable slug later: `/movies/412-the-batman`.)
- List state in query params (`/movies?platform=itunes&sort=year`) so filtered lists are shareable and refresh-safe too.
- **Refresh guarantee:** App Router serves `app/movies/[id]/page.tsx` correctly on deep-link refresh by design. (If we ever drop to a plain SPA, a Pages `_redirects` rule `/* /index.html 200` is mandatory — skipping it is exactly what 404'd and bounced the old apps home.)
- **Optional polish (P2):** route-backed modals — row click opens detail as a modal *and* sets the URL to `/movies/{id}`; a direct visit/refresh renders the full page.

---

## 6. Data Model (D1)

Seed data already cleaned: `movies.seed.json`, `tv.seed.json`, `games.seed.json`. Counts: **862 movies, 237 series / 379 seasons, 126 games**.

Platform lists stored as JSON text, queried with SQLite `json_each()` for "owned on X" filters. (Normalized join tables are the heavier alternative if ever needed — not at this scale.)

```sql
-- MOVIES
CREATE TABLE movies (
  id          INTEGER PRIMARY KEY,
  tmdb_id     INTEGER,            -- supplied on entry; drives all metadata
  title       TEXT NOT NULL,      -- from TMDB; editable override
  year        INTEGER,            -- from TMDB
  poster_url  TEXT,               -- from TMDB, cached
  digital     TEXT DEFAULT '[]',  -- JSON: ["iTunes","Movies Anywhere",...]
  physical    TEXT DEFAULT '[]',  -- JSON: ["Blu-Ray","DVD"]
  needs_review INTEGER DEFAULT 0, -- bulk backfill couldn't confidently map -> I fix later
  date_added  TEXT DEFAULT (datetime('now'))
);

-- TV
CREATE TABLE tv_series (
  id          INTEGER PRIMARY KEY,
  tmdb_id     INTEGER,
  series      TEXT NOT NULL,
  year        INTEGER,
  poster_url  TEXT,
  needs_review INTEGER DEFAULT 0,
  date_added  TEXT DEFAULT (datetime('now'))
);
CREATE TABLE tv_seasons (
  id          INTEGER PRIMARY KEY,
  series_id   INTEGER NOT NULL REFERENCES tv_series(id) ON DELETE CASCADE,
  season      INTEGER,
  episode_count INTEGER,          -- from TMDB, so "Specific" knows N
  episodes    TEXT,               -- "all" | JSON array of ints | "review"
  owned_on    TEXT DEFAULT '[]'   -- JSON: ["iTunes","Amazon Video","Xbox Video"]
);

-- GAMES
CREATE TABLE games (
  id           INTEGER PRIMARY KEY,
  rawg_id      INTEGER,           -- supplied on entry; drives metadata
  title        TEXT NOT NULL,
  cover_url    TEXT,
  service      TEXT,              -- "PlayStation" | "Xbox" | NULL
  format       TEXT,              -- "Digital" | "Disc" | NULL
  needs_tagging INTEGER DEFAULT 0, -- 39 seed games missing service/format
  date_added   TEXT DEFAULT (datetime('now'))
);
```

---

## 7. The Catalogs (UX)

### Entry page
Launchpad: three large cards (Movies / TV / Games) with item counts, plus a global search that spans all three and deep-links to the right detail page.

### Catalog view (shared pattern)
- **Sortable, filterable table.** Each row leads with a cover-art thumbnail, then title + key columns.
- **Sort** by any column; **filter** per catalog; **search** within catalog. State lives in the URL (query params).
- Row click → detail route. A **+ Add** button sits in the header (top-right, by search/filters) → `/{catalog}/new`.

| Catalog | Table columns | Filters |
|---|---|---|
| Movies | thumb, title, year, owned-on (chips) | platform/locker, physical vs digital, year |
| TV | thumb, series, # seasons, owned-on | platform, complete vs partial seasons |
| Games | thumb, title, service, format, status | service (PS/Xbox), Digital/Disc, needs-tagging |

### Detail view (`/{catalog}/{id}`)
- Large cover art, title, year, metadata.
- **Movies:** every place I own it — digital lockers + physical formats — as chips. The "where do I open it" payoff.
- **TV:** the season grid (below), showing owned seasons/episodes + platform per season.
- **Games:** service, format, tagging status.
- **Edit / Delete** live here (delete confirms).

---

## 8. Entry & Edit Flows (paste-an-ID model)

The through-line: **paste an ID → app fetches metadata + art → I set ownership.**

**Where it lives:** the **+ Add** button on each catalog view opens `/{catalog}/new` (its own refresh-safe route). The ID field accepts a pasted TMDB/RAWG **URL or bare ID** — the app extracts the number either way. On save, redirect to the new `/{catalog}/{id}`.

### Add a Movie
1. Paste **TMDB ID**.
2. App fetches + shows a preview (poster, title, year) to eyeball it's the right one.
3. Tick platforms (Movies Anywhere, iTunes, Blu-Ray…).
4. Save. Title/year/art come from TMDB; title is an editable override.

### Add a TV Series
1. Paste the **series** TMDB ID.
2. App pulls series name, poster, and the **full season list with episode counts**.
3. App renders a **season grid**, one row per season: `[own?] [All ▾ / Specific] [platform]`.
   - Owned seasons default to **All**.
   - Switch a row to **Specific** → checkboxes 1…N (N known from TMDB) for partial-season ownership.
   - Set a platform once → cascades to owned seasons, with per-season override (S1 iTunes, S3 Amazon).
4. Save. Same grid reopens in the detail view for edits.

### Add a Game
1. Paste **RAWG ID** (or slug).
2. App fetches title + cover.
3. Set service (PS/Xbox) + format (Digital/Disc).
4. Save.

### Editing existing seed items
- All metadata is editable in the detail popup (your preferred workflow — no upfront cleanup required).
- **Movies one-time backfill:** a throwaway migration script (not app code) maps existing titles to TMDB IDs once and fills art where confident; anything unsure is flagged `needs_review` for me to fix in-app later. TV/Games start ID-less and get IDs as I touch them.
- The 39 `needs_tagging` games show an "untagged" badge, sort to the top of a filter, and take two clicks to complete.

---

## 9. Phasing

**P0 — Core**
- D1 schema + seed import.
- Next.js routing scaffold (`/`, `/movies`, `/movies/{id}`, `/tv`, `/tv/{id}`, `/games`, `/games/{id}`).
- Launchpad + three catalog tables with cover art.
- Detail views (incl. TV season grid, read mode).
- Sort / filter / search via query params.
- Cloudflare Access wired up.

**P1 — Writable + metadata**
- Add / edit / delete flows (paste-an-ID for all three).
- TV season-grid editor.
- TMDB + RAWG fetch-on-entry + art caching.
- One-time movie backfill script + `needs_review` review flow.
- Untagged-game tagging flow.

**P2 — Polish / parking lot**
- Route-backed modals.
- Global cross-catalog search on launchpad.
- "Recently added" view.
- Bulk edit.
- Export back to CSV/JSON (backup).

---

## 10. Resolved Decisions

- **Subdomain:** `trove.joshmuthumani.com`. ✓
- **Name:** Trove. ✓
- **TV blank `owned_on`:** v1 behavior — treat blank as "owned, source unspecified": show no platform chip, never block. I'll reclassify case-by-case during review as I touch each series. ✓
