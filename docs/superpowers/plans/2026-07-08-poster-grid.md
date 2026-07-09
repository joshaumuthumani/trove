# Poster-grid Browse View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a poster-grid browse view for Movies and Games, defaulting to grid with the existing table available via a URL-driven toggle; TV stays table-only.

**Architecture:** `CatalogView` becomes a thin shell that renders either `<CatalogGrid>` or `<CatalogTable>` (extracted from today's inline table) from the same `DisplayRow[]`. The effective view is resolved server-side from `?view=` by a pure `resolveView()` helper so first paint is correct with no hydration flash. A `Segmented` toggle in `FilterBar` writes `?view=`.

**Tech Stack:** Next.js App Router (RSC + client components), TypeScript, Tailwind v4 + hand-authored CSS in `globals.css`, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-07-08-poster-grid-design.md`

## Global Constraints

- **This Next.js has breaking changes vs training data** — consult `node_modules/next/dist/docs/` before App Router changes (per AGENTS.md).
- Run `npm run lint`, `npx tsc --noEmit`, and `npm test` before every commit (per CLAUDE.md).
- Keep CSS class names stable and prefixed as the file does (kebab, `catgrid-*`); reuse existing tokens (`--surface-*`, `--border`, `--r-md`, `--shadow-poster`, `--ease`, `--accent-2`).
- WCAG 2.1 AA for all user-facing elements.
- Tests are `node:test` + `node:assert/strict`, run by `npm test` (`node --import tsx --test src/lib/*.test.ts`) — only `src/lib/*.test.ts` is collected. No component-test harness exists; components are verified by running the app.
- Reads = RSC; writes untouched. No query, mutation, schema, or `DisplayRow` changes.

---

### Task 1: `resolveView` pure helper

**Files:**
- Modify: `src/lib/catalog.ts` (add export near `titleSortKey`)
- Test: `src/lib/catalog.test.ts` (append)

**Interfaces:**
- Consumes: `Catalog` from `src/lib/types` (already imported in `catalog.ts`).
- Produces: `resolveView(catalog: Catalog, viewParam: string | undefined): "grid" | "table"` — used by Task 4's server pages.

- [ ] **Step 1: Write the failing tests** — append to `src/lib/catalog.test.ts`:

```ts
import { resolveView } from "./catalog";

test("resolveView: movies/games default to grid when no param", () => {
  assert.equal(resolveView("movies", undefined), "grid");
  assert.equal(resolveView("games", undefined), "grid");
});

test("resolveView: explicit table is honored for movies/games", () => {
  assert.equal(resolveView("movies", "table"), "table");
  assert.equal(resolveView("games", "table"), "table");
});

test("resolveView: unrecognized param falls back to the catalog default", () => {
  assert.equal(resolveView("movies", "garbage"), "grid");
  assert.equal(resolveView("games", "grid"), "grid");
});

test("resolveView: TV is always table, even with ?view=grid", () => {
  assert.equal(resolveView("tv", "grid"), "table");
  assert.equal(resolveView("tv", undefined), "table");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `resolveView is not a function` / not exported.

- [ ] **Step 3: Implement `resolveView`** — add to `src/lib/catalog.ts` (e.g. right after `titleSortKey`):

```ts
// Resolve the effective browse view from the URL ?view= param. TV has no grid,
// so it is always "table"; Movies/Games default to "grid" and only switch to
// "table" on an explicit ?view=table (any other value falls back to grid).
export function resolveView(catalog: Catalog, viewParam: string | undefined): "grid" | "table" {
  if (catalog === "tv") return "table";
  return viewParam === "table" ? "table" : "grid";
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS (all `resolveView` tests green, existing tests still green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog.ts src/lib/catalog.test.ts
git commit -m "feat(catalog): add resolveView helper for grid/table view

Refs #32"
```

---

### Task 2: Extract `CatalogTable` from `CatalogView` (behavior-preserving)

Pure refactor — moves today's inline table into its own component. No visible change. De-risks the split before the grid arrives.

**Files:**
- Create: `src/components/catalog-table.tsx`
- Modify: `src/components/catalog-view.tsx` (remove inline table + now-unused bits; render `<CatalogTable>`)

**Interfaces:**
- Consumes: `DisplayRow` from `./catalog-view`; `Density` from `./filter-bar`; `Catalog` from `@/lib/types`; `CATALOG_META` from `@/lib/catalog`.
- Produces: `CatalogTable({ catalog, rows, density, detailHref, markInApp })` — used by `CatalogView` here and Task 4.

- [ ] **Step 1: Create `src/components/catalog-table.tsx`** with the table JSX moved verbatim from `catalog-view.tsx`:

```tsx
"use client";
/* Trove — catalog table body. Extracted from CatalogView; presentation only. */
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { PosterTile } from "@/components/ui/poster";
import { LogoRow } from "@/components/ui/marks";
import { GamePlatformChips } from "@/components/ui/game-chips";
import { CATALOG_META } from "@/lib/catalog";
import type { Catalog } from "@/lib/types";
import type { DisplayRow } from "./catalog-view";
import type { Density } from "./filter-bar";

export function CatalogTable({
  catalog,
  rows,
  density,
  detailHref,
  markInApp,
}: {
  catalog: Catalog;
  rows: DisplayRow[];
  density: Density;
  detailHref: (id: number) => string;
  markInApp: () => void;
}) {
  const cfg = CATALOG_META[catalog];
  const thumb = density === "compact" ? 34 : 46;
  const maxChips = density === "compact" ? 2 : 3;
  return (
    <div className="table" data-cat={catalog}>
      <div className="thead">
        <span className="th th-thumb"></span>
        <span className="th th-title">Title</span>
        {catalog === "tv" && <span className="th th-num">Seasons</span>}
        {catalog !== "games" && <span className="th th-dir">{catalog === "tv" ? "Created by" : "Director"}</span>}
        {catalog === "games" && <span className="th th-own">Owned on</span>}
        <span className="th th-year">Year</span>
        {catalog !== "games" && <span className="th th-score">Score</span>}
        {catalog !== "games" && <span className="th th-own">Owned on</span>}
        {catalog === "games" && <span className="th th-status">Status</span>}
      </div>
      <div className="tbody">
        {rows.map((r) => (
          <Link key={r.id} className="trow" href={detailHref(r.id)} onClick={markInApp}>
            <span className="td td-thumb">
              <PosterTile title={r.title} year={r.year} src={r.poster_url} size={thumb} rounded={6} ratio={cfg.ratio} kind={cfg.icon} />
            </span>
            <span className="td td-title">
              <span className="trow-title">{r.title}</span>
              {r.badge && catalog !== "games" && <Badge kind={r.badge} />}
            </span>
            {catalog === "tv" && (
              <span className="td td-num">
                {r.owned}
                <span className="td-num-sub">/{r.seasons}</span>
              </span>
            )}
            {catalog !== "games" && <span className="td td-dir">{r.director || "—"}</span>}
            {catalog === "games" && (
              <span className="td td-own">
                <GamePlatformChips entries={r.platforms || []} max={maxChips} size={22} />
              </span>
            )}
            <span className="td td-year">{r.year || "—"}</span>
            {catalog !== "games" && (
              <span className="td td-score">
                {r.user_score != null ? (
                  <>
                    <Icon name="star" size={12} />
                    {r.user_score.toFixed(1)}
                  </>
                ) : (
                  "—"
                )}
              </span>
            )}
            {catalog !== "games" && (
              <span className="td td-own">
                <LogoRow names={r.chips} max={maxChips} size={22} counts={catalog === "tv" ? r.chipCounts : undefined} />
              </span>
            )}
            {catalog === "games" && (
              <span className="td td-status">
                {r.badge ? (
                  <Badge kind="needs_tagging" />
                ) : (
                  <span className="status-ok">
                    <Icon name="check" size={14} />
                    Tagged
                  </span>
                )}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Slim `catalog-view.tsx`** — replace the inline `<div className="table">…</div>` block (currently the `else` branch of the empty check) with `<CatalogTable …/>`, add the import, and remove the now-unused imports (`PosterTile`, `LogoRow`, `GamePlatformChips`, `Badge`) and the now-unused `thumb`/`maxChips` locals. The render becomes:

```tsx
// add near the other imports:
import { CatalogTable } from "@/components/catalog-table";

// …inside the component, delete the `thumb`/`maxChips` consts, then:
      {rows.length === 0 ? (
        <div className="cat-empty">
          <div className="cat-empty-icon">
            <Icon name="search" size={26} />
          </div>
          <p>No {cfg.name.toLowerCase()} match your filters.</p>
          <Button variant="ghost" size="sm" onClick={() => router.replace(pathname, { scroll: false })}>
            Clear filters
          </Button>
        </div>
      ) : (
        <CatalogTable catalog={catalog} rows={rows} density={density} detailHref={detailHref} markInApp={markInApp} />
      )}
```

Keep `Icon` and `Button` imports (used by the header + empty state) and `Link` (header + FAB).

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, no unused-import errors.

- [ ] **Step 4: Verify no behavior change in the app**

Run: `npm run dev`, open `http://localhost:3000/movies`, `/tv`, `/games`.
Expected: tables render and behave exactly as before (rows, columns, badges, density toggle, row click → detail with back).

- [ ] **Step 5: Commit**

```bash
git add src/components/catalog-table.tsx src/components/catalog-view.tsx
git commit -m "refactor(catalog): extract CatalogTable from CatalogView

Refs #32"
```

---

### Task 3: `PosterTile` fill mode (for fluid grid cells)

**Files:**
- Modify: `src/components/ui/poster.tsx`

**Interfaces:**
- Produces: `PosterTile` `size` prop now accepts `number | "fill"`. With `"fill"`, the tile is `width: 100%` and placeholder text/icon sizing uses a fixed 160px basis. Existing numeric callers (the table) are unchanged.

- [ ] **Step 1: Widen the `size` prop and add the fill basis** — in `poster.tsx`, change the prop type and derive a numeric `basis`:

```tsx
// in the prop type block:
  size?: number | "fill";
```

```tsx
// at the top of the component body, replace the existing `const grad = …` area
// so both `isFill` and `basis` are available:
  const isFill = size === "fill";
  const basis = isFill ? 160 : size; // px basis for placeholder text/icon sizing
  const grad = missing ? null : posterGradient(title || "");
```

- [ ] **Step 2: Apply fill width and swap `size` → `basis` in the placeholder math** — update the wrapper `style` width and every placeholder measurement:

```tsx
  return (
    <div
      className={cx("poster", className)}
      style={{
        width: isFill ? "100%" : size,
        aspectRatio: ratio,
        borderRadius: rounded,
        flex: "0 0 auto",
        ...(missing ? { background: "var(--surface-3)" } : grad),
      }}
    >
      {missing ? (
        <div className="poster-missing">
          <Icon name={kind} size={Math.max(16, basis * 0.32)} />
          <span style={{ fontSize: Math.max(7, basis * 0.14) }}>no art</span>
        </div>
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="poster-img" src={src} alt={title || ""} draggable={false} />
      ) : (
        <>
          <span className="poster-watermark" style={{ fontSize: basis * 0.55 }}>
            {initials}
          </span>
          <div className="poster-meta">
            <span className="poster-title" style={{ fontSize: Math.max(8, basis * 0.13) }}>
              {title}
            </span>
            {year ? (
              <span className="poster-year" style={{ fontSize: Math.max(7, basis * 0.11) }}>
                {year}
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 4: Verify the table is visually unchanged**

Run: `npm run dev`, open `/movies` (table uses numeric `size`, so thumbnails must look identical to before).
Expected: no change to table thumbnails.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/poster.tsx
git commit -m "feat(poster): add fill mode for fluid grid cells

Refs #32"
```

---

### Task 4: `CatalogGrid` + grid CSS + view plumbing (grid becomes reachable)

Builds the grid and wires the `view` prop end-to-end so it renders. This is the milestone where the grid is visible and verifiable.

**Files:**
- Create: `src/components/catalog-grid.tsx`
- Modify: `src/app/globals.css` (append grid classes)
- Modify: `src/components/catalog-view.tsx` (add `view` prop + branch)
- Modify: `src/app/movies/page.tsx`, `src/app/games/page.tsx`, `src/app/tv/page.tsx` (read `?view`, pass prop)

**Interfaces:**
- Consumes: `DisplayRow`, `Density`, `Catalog`, `CATALOG_META`, `LogoRow`, `GamePlatformChips`, `Badge`, `PosterTile` (fill), `resolveView`.
- Produces: `CatalogGrid({ catalog, rows, density, detailHref, markInApp })`; `CatalogView` gains a required `view: "grid" | "table"` prop.

- [ ] **Step 1: Create `src/components/catalog-grid.tsx`**:

```tsx
"use client";
/* Trove — poster-grid browse view for Movies & Games. Renders the same
   DisplayRow[] the table does; art leads, ownership marks always visible. */
import Link from "next/link";
import { PosterTile } from "@/components/ui/poster";
import { Badge } from "@/components/ui/badge";
import { LogoRow } from "@/components/ui/marks";
import { GamePlatformChips } from "@/components/ui/game-chips";
import { CATALOG_META } from "@/lib/catalog";
import type { Catalog } from "@/lib/types";
import type { DisplayRow } from "./catalog-view";
import type { Density } from "./filter-bar";

export function CatalogGrid({
  catalog,
  rows,
  density,
  detailHref,
  markInApp,
}: {
  catalog: Catalog;
  rows: DisplayRow[];
  density: Density;
  detailHref: (id: number) => string;
  markInApp: () => void;
}) {
  const cfg = CATALOG_META[catalog];
  const maxMarks = density === "compact" ? 4 : 3;
  return (
    <div className="catgrid" data-cat={catalog}>
      {rows.map((r) => (
        <Link key={r.id} className="catgrid-tile" href={detailHref(r.id)} onClick={markInApp}>
          <div className="catgrid-art">
            <PosterTile title={r.title} year={r.year} src={r.poster_url} size="fill" rounded={10} ratio={cfg.ratio} kind={cfg.icon} />
            {r.badge && (
              <span className="catgrid-badge">
                <Badge kind={r.badge} />
              </span>
            )}
          </div>
          <span className="catgrid-title">{r.title}</span>
          <span className="catgrid-marks">
            {catalog === "games" ? (
              <GamePlatformChips entries={r.platforms || []} max={maxMarks} size={20} />
            ) : (
              <LogoRow names={r.chips} max={maxMarks} size={20} />
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Append grid CSS** to `src/app/globals.css` (after the `CATALOG` section):

```css
/* ============================ CATALOG GRID ============================ */
.catgrid{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(var(--tile,164px),1fr))}
.density-comfortable .catgrid{--tile:164px;gap:20px}
.density-compact .catgrid{--tile:120px;gap:14px}
.catgrid-tile{display:flex;flex-direction:column;gap:9px;text-align:left;transition:transform .16s var(--ease)}
.catgrid-tile:hover{transform:translateY(-3px)}
.catgrid-tile:hover .poster{box-shadow:0 12px 28px -10px rgba(0,0,0,.8)}
.catgrid-tile:focus-visible{outline:none;box-shadow:none}
.catgrid-tile:focus-visible .poster{box-shadow:0 0 0 3px var(--accent-2)}
.catgrid-art{position:relative}
.catgrid-badge{position:absolute;top:7px;left:7px;z-index:2}
.catgrid-title{font-weight:600;font-size:14.5px;line-height:1.25;color:var(--text);text-wrap:balance;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.density-compact .catgrid-title{font-size:13px}
.catgrid-marks{min-height:22px}
```

- [ ] **Step 3: Add the `view` prop + branch to `catalog-view.tsx`** — add the import, extend the props, and branch the render:

```tsx
// with the other imports:
import { CatalogGrid } from "@/components/catalog-grid";

// extend the component signature:
export function CatalogView({
  catalog,
  rows,
  total,
  view,
}: {
  catalog: Catalog;
  rows: DisplayRow[];
  total: number;
  view: "grid" | "table";
}) {

// replace the empty/table branch tail with a three-way:
      {rows.length === 0 ? (
        <div className="cat-empty">
          <div className="cat-empty-icon">
            <Icon name="search" size={26} />
          </div>
          <p>No {cfg.name.toLowerCase()} match your filters.</p>
          <Button variant="ghost" size="sm" onClick={() => router.replace(pathname, { scroll: false })}>
            Clear filters
          </Button>
        </div>
      ) : view === "grid" ? (
        <CatalogGrid catalog={catalog} rows={rows} density={density} detailHref={detailHref} markInApp={markInApp} />
      ) : (
        <CatalogTable catalog={catalog} rows={rows} density={density} detailHref={detailHref} markInApp={markInApp} />
      )}
```

- [ ] **Step 4: Wire the server pages to read `?view`.** In `src/app/movies/page.tsx`: import `resolveView`, read the param, pass the prop:

```tsx
// change the catalog import:
import { buildMovieRows, resolveView, type CatalogParams } from "@/lib/catalog";

// after `const sp = await searchParams;` and the movies query, compute view:
  const view = resolveView("movies", str(sp.view));

// change the return:
  return <CatalogView catalog="movies" rows={rows} total={movies.length} view={view} />;
```

Apply the identical three edits to `src/app/games/page.tsx` (using `resolveView("games", str(sp.view))` and `catalog="games"`) and to `src/app/tv/page.tsx` (using `resolveView("tv", str(sp.view))` and `catalog="tv"`). `resolveView("tv", …)` always returns `"table"`, so TV renders the table regardless of the URL.

- [ ] **Step 5: Typecheck + lint + tests**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS (every `CatalogView` caller now passes `view`).

- [ ] **Step 6: Verify the grid renders and SSRs correctly**

Run: `npm run dev`, then:
- `/movies` and `/games` → poster grid by default (art + title + ownership marks; needs_review badge on flagged movies; Untagged badge on untagged games, still floated to top).
- `/movies?view=table` → the table (view-source / first paint shows the table markup, no flash to grid).
- `/tv` and `/tv?view=grid` → table only.
- Density compact/comfortable changes tile size.

Expected: all as described.

- [ ] **Step 7: Commit**

```bash
git add src/components/catalog-grid.tsx src/app/globals.css src/components/catalog-view.tsx src/app/movies/page.tsx src/app/games/page.tsx src/app/tv/page.tsx
git commit -m "feat(catalog): add poster grid view for Movies & Games

Refs #32"
```

---

### Task 5: View toggle in `FilterBar` (hidden for TV)

**Files:**
- Modify: `src/components/filter-bar.tsx`
- Modify: `src/components/catalog-view.tsx` (pass `view` down to `FilterBar`)

**Interfaces:**
- Consumes: `Segmented` (already imported in `filter-bar.tsx`), `resolveView` output via the new `view` prop.
- Produces: `FilterBar` gains a required `view: "grid" | "table"` prop.

- [ ] **Step 1: Add the `view` prop to `FilterBar`** — extend its signature:

```tsx
export function FilterBar({
  catalog,
  density,
  setDensity,
  view,
}: {
  catalog: Catalog;
  density: Density;
  setDensity: (d: Density) => void;
  view: "grid" | "table";
}) {
```

- [ ] **Step 2: Render the toggle** — in `filter-bar.tsx`, immediately before the existing density `Segmented`, add (writing `""` for grid keeps the default URL clean, matching `resolveView`):

```tsx
        {catalog !== "tv" && (
          <Segmented
            size="sm"
            value={view}
            onChange={(v) => setParam("view", v === "grid" ? "" : v)}
            options={[
              { value: "grid", icon: "grid", title: "Poster grid" },
              { value: "table", icon: "list", title: "Table" },
            ]}
          />
        )}
```

- [ ] **Step 3: Pass `view` from `CatalogView`** — update the `FilterBar` usage in `catalog-view.tsx`:

```tsx
      <FilterBar catalog={catalog} density={density} setDensity={setDensity} view={view} />
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 5: Verify the toggle**

Run: `npm run dev`:
- `/movies`: grid button active by default; clicking **Table** switches to the table and sets `?view=table`; clicking **Grid** returns to grid and removes `?view`.
- During the switch the current view stays visible (no blank flash), matching a sort change.
- `/tv`: no grid/table toggle shown.
- Back/forward across a toggle restores the prior view.

Expected: all as described.

- [ ] **Step 6: Commit**

```bash
git add src/components/filter-bar.tsx src/components/catalog-view.tsx
git commit -m "feat(catalog): add grid/table view toggle to FilterBar

Refs #32"
```

---

### Task 6: Accessibility confirmation + final verification

**Files:**
- Verify: `src/components/ui/game-chips.tsx` (read-only unless a gap is found)

- [ ] **Step 1: Confirm ownership marks expose service names** — open `src/components/ui/game-chips.tsx` and confirm each rendered mark ultimately uses `ServiceMark`/`FormatBadge` (which already set `title` + `alt` to the service name). If any logo `<img>` there renders without an `alt`/`title`, add `alt={serviceName}` to match `marks.tsx`. No change expected.

- [ ] **Step 2: Keyboard + screen-reader spot check**

Run: `npm run dev`, on `/movies` grid:
- Tab through tiles: each shows the gold focus ring on its poster; Enter opens the detail.
- Each tile's accessible name is its title; hovering/inspecting a service mark exposes the service name.

- [ ] **Step 3: Data parity + responsive check**

- Apply a filter/sort in table view, toggle to grid: the same items appear in the same order (untagged games still first).
- Resize the window mobile → tablet → desktop: columns reflow via `auto-fill`; the page body never scrolls horizontally.

- [ ] **Step 4: Full verification gate**

Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: all PASS.

- [ ] **Step 5: Commit (if Step 1 changed anything) and close the feature**

```bash
git add -A
git commit -m "chore(catalog): confirm grid a11y + final verification

Closes #32"
```

If Step 1 made no change, amend the commit message onto the Task 5 commit instead, or make an empty-tree note — do not fabricate a change.

---

## Notes for the implementer

- **TV is deliberately excluded** from the grid (tracked as #33). `resolveView` enforces this; do not add a TV grid.
- **Do not** change `DisplayRow`, queries, mutations, detail views, or the season grid.
- The toggle intentionally triggers a server re-render (D1 re-query) on each flip — this is the accepted design (spec §2 D5), not a bug to "optimize" into client state.
