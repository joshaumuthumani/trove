# Poster-grid browse view for Movies & Games — Design

- **Feature issue:** #32 (Artifact-forward catalog browsing)
- **Deferred sub-issue:** #33 (TV grid — table-only for now)
- **Register:** product · **Principles engaged:** 1 (representation follows the artifact), 2 (shared task vocabulary), 3 (ownership is the answer), 5 (the URL is the state)
- **Date:** 2026-07-08

## 1. Problem

The catalog is table-first for all three catalogs. Per PRODUCT.md Principle 1, a
movie and a game are single owned objects whose box art *is* their identity, so
they should **browse as a poster grid**. Today the poster is a 34–46px thumbnail
in a dense row; the art never leads. This feature adds a poster-grid browse view
for Movies and Games, with the existing table preserved as a fast-lookup toggle.

TV is out of scope (see §9); its container-shaped, per-season ownership is not
faithfully summarized by a single poster. Tracked as #33.

## 2. Decisions (locked during shaping)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Movies/Games **default to Grid**; Table available via toggle. TV stays table-only. | Principle 1; Principle 2 permits browse representation to differ per catalog while the task vocabulary stays identical. |
| D2 | Grid tile = poster + title + **always-visible ownership marks** below (`+N` overflow). | Grid is the default view, so the couch "which service has this" job lands there; marks keep the <5s answer without hover or toggle. Hover-reveal rejected (fails touch); art-only rejected (pushes the primary job to a secondary view). |
| D3 | View mode persists in the **URL** (`?view=grid\|table`). | Catalog pages are RSC that render from URL state; view-in-URL means the server renders the correct view on first paint — no table→grid hydration flash. localStorage rejected: server can't see it → whole-view flash on every load. "Both in URL" (moving density too) rejected as out-of-scope change to working code. |
| D4 | **Approach A:** split `CatalogView` into `CatalogTable` + `CatalogGrid` siblings. | Clean, independently testable boundaries; `CatalogView` is already ~200 lines doing several jobs. Inline branch and separate-route approaches rejected (file-too-large; duplicates filter bar / data loading). |
| D5 | Toggle uses the **existing `FilterBar` `setParam` + `useTransition`** path (server round-trip). | Consistent with how sort/filter already behave; old view stays visible during the transition (no blank). Accepts a D1 re-query on toggle — same cost as changing the sort, negligible for a single-user dataset. Instant-client-state alternative rejected as unnecessary complexity. |

## 3. Architecture

```
movies/page.tsx (RSC)  ── reads searchParams.view → resolveView() ──┐
games/page.tsx  (RSC)  ── same ────────────────────────────────────┤
tv/page.tsx     (RSC)  ── resolveView() always returns "table" ────┤
                                                                    ▼
CatalogView (client shell)  { catalog, rows, total, view }
  ├─ cat-header + FilterBar        (FilterBar shows view toggle when catalog !== "tv")
  ├─ if rows.length === 0 → cat-empty     (shared, unchanged)
  └─ view === "grid" ? <CatalogGrid …/> : <CatalogTable …/>   ← identical DisplayRow[]
```

### Components

- **`resolveView(catalog, viewParam): "grid" | "table"`** — pure. Default:
  `grid` for movies/games, `table` for tv. Forces `table` for tv regardless of
  the param (so a hand-typed `?view=grid` on `/tv` can't render a nonexistent TV
  grid). Any unrecognized `viewParam` falls back to the catalog default. Lives in
  `src/lib/catalog.ts`; unit-tested.
- **`CatalogView`** (existing, becomes a thin shell) — keeps density state, the
  in-app/back-link logic (`sessionStorage` inapp flag, `markInApp`), and
  `detailHref`; passes them to whichever child renders. Receives `view` as a prop
  from the server page (not read client-side) so first paint is correct.
- **`CatalogTable`** (new) — the current table JSX moved almost verbatim. Props:
  `{ catalog, rows, density, detailHref, markInApp }`.
- **`CatalogGrid`** (new) — props: `{ catalog, rows, density, detailHref, markInApp }`.
  Renders the responsive poster grid (§4).
- **`FilterBar`** (modified) — gains a `Segmented` grid/table control, rendered
  only when `catalog !== "tv"`, writing `?view=` through the existing `setParam`.
  Density control unchanged.
- **`PosterTile`** (modified) — gains a `fill` mode (§4).

**Unchanged:** `src/lib/queries.ts`, `mutations.ts`, `DisplayRow`, detail views,
`season-grid.tsx`, `LogoRow`, `GamePlatformChips`, `Badge`.

### Data flow

`DisplayRow` already carries everything the grid needs: `poster_url`, `title`,
`year`, `chips` (movies owned-on names), `platforms` (games), `badge`. No query,
mutation, or schema change. The grid renders the same server-filtered, server-
sorted rows the table receives — so filter, sort, search, and the untagged-games
float-to-top ordering all keep working with zero extra work.

## 4. Grid tile

```
┌────────────┐
│    art     │   PosterTile (cached img / gradient / "no art" fallback)
│            │   aspect = cfg.ratio (movies 2/3; games box art)
└────────────┘
 The Batman          ← .catgrid-title, 1–2 lines, ellipsis, text-wrap: balance
 []  []  []  +2       ← movies: LogoRow(chips) · games: GamePlatformChips(platforms)
```

- The tile is a `<Link href={detailHref(id)} onClick={markInApp}>` — keyboard
  focus and the global gold focus-visible ring come for free.
- **Badges:** movies show the `needs_review` badge; games show the `Untagged`
  badge — overlaid on the art's top-left corner (small), since the tile has no
  status column. A tagged game shows its platform marks and no badge.
- **Omitted fields:** year, director, and score do **not** appear on the tile —
  the grid is art-forward, and those live in the table view and the detail page.
  They remain valid **sort** keys (sorting the grid by score with score hidden is
  fine, the same way a photo grid sorts by date); only their on-tile display is
  dropped.
- **`PosterTile` fill mode:** today `PosterTile` takes a fixed pixel `size` and
  computes its placeholder overlay font-sizes from it in JS. Grid cells are fluid
  (`1fr`), so add `size="fill"` → `width: 100%`; move the placeholder overlay
  font-sizing to CSS (relative units / `cqw`) for that mode. Fixed-size callers
  (the table thumbnail) are unaffected.

## 5. Layout, responsive, motion

- Grid: `grid-template-columns: repeat(auto-fill, minmax(var(--tile), 1fr))`.
- **Density applies to grid too:** `--tile` ≈ 160px comfortable, ≈ 120px compact
  → larger/fewer vs smaller/more tiles. Density gains a real meaning in grid.
- New classes in `globals.css`: `.catgrid`, `.catgrid-tile`, `.catgrid-art`,
  `.catgrid-title`, `.catgrid-marks`, `.catgrid-badge`. Reuse tokens
  (`--surface-*`, `--border`, `--r-md`, `--shadow-poster`, `--ease`).
- Hover: subtle lift (`translateY(-2px)`) + poster shadow. Restrained per the
  product register — gold is spent only on the focus ring, never on hover. The
  existing `prefers-reduced-motion` rule covers the lift.

## 6. Accessibility (WCAG 2.1 AA)

- View toggle: `Segmented` buttons with `title`/`aria-label`.
- Each tile's accessible name is its title (`PosterTile` `alt`).
- **Ownership marks must expose service names to assistive tech** — verify
  `LogoRow` / `GamePlatformChips` render an `aria-label` per mark (e.g. "iTunes").
  If they don't already, adding it is part of this work (PRODUCT.md a11y baseline:
  "where can I open it" answerable without sight).
- Title contrast: `--text` on the page bg (well above AA).
- Keyboard: tiles are links → full parity via the global focus-visible system.

## 7. Testing & verification

- **Unit (existing `node:test` via tsx):** `resolveView` — `movies/undefined→grid`,
  `movies/"table"→table`, `games/"garbage"→grid`, `tv/"grid"→table`,
  `tv/undefined→table`. Added to `src/lib/catalog.test.ts` (or a new test file
  next to it).
- **No component-test harness exists** (tests are pure-logic only); the views are
  verified by driving the running app rather than introducing a framework this
  feature doesn't warrant: (a) data parity — grid shows the same items as the
  table for the same filters; (b) toggle round-trips `?view=`; (c) direct-load
  `?view=table` renders the table server-side with no flash; (d) empty state;
  (e) responsive column counts at mobile/tablet/desktop widths; (f) keyboard
  focus traversal. Captured with the dev server + screenshots.

## 8. Files

- **New:** `src/components/catalog-grid.tsx`, `src/components/catalog-table.tsx`,
  `resolveView` + tests in `src/lib/catalog.ts` / `catalog.test.ts`.
- **Modified:** `src/components/catalog-view.tsx` (shell), `filter-bar.tsx`
  (toggle), `src/app/{movies,games,tv}/page.tsx` (read `?view`, pass prop),
  `src/app/globals.css` (grid classes), `src/components/ui/poster.tsx` (fill mode).

## 9. Non-goals (YAGNI)

- **No TV grid** — tracked as #33, reviewed after Movies/Games ships.
- No change to the density mechanism (stays localStorage).
- No new data, columns, queries, or mutations.
- No virtualization / infinite scroll (small single-user dataset).
- No route-modals, no sharing, no animation beyond the subtle hover lift.
