@AGENTS.md

# Trove — project notes

- **Design source of truth:** `db/source/` keeps the PRD; the hi-fi prototype it
  was ported from lives in the design handoff. The prototype's CSS was ported
  verbatim into `src/app/globals.css` — keep class names stable so components map
  1:1. Status hues (amber `needs_review`, indigo `Untagged`, green tagged) must
  stay distinct from the rose action accent.
- **Ownership marks:** services render as square logo tiles (`ServiceMark`),
  physical formats as logo pills (`FormatBadge`); routed by `isPhysical()`. Games
  collapse same-service entries via `groupGamePlatforms()`. See
  `src/lib/platforms.ts` and `src/components/ui/`.
- **Data flow:** reads = RSC querying D1 (`src/lib/queries.ts`); writes + TMDB/
  RAWG fetch = route handlers in `src/app/api/*` (`src/lib/mutations.ts`,
  `tmdb.ts`, `rawg.ts`). D1 binding is `DB`, accessed via `getDb()` in
  `src/lib/db.ts` (works under `next dev` via `initOpenNextCloudflareForDev`).
- **Schema note (README > PRD):** games store ownership as a JSON `platforms`
  array (multi-platform), not the PRD's single service/format columns; games and
  tv_series also carry `year`, tv_series carries `note`.
- **Seeding:** `npm run build:seed` → `db/seed/*.json`; `npm run db:seed:local`
  (or `:remote`). Regenerate the JSON when real data lands — no app changes.
- Run `npm run lint` and `npx tsc --noEmit` before committing.
