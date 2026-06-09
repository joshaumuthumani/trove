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
- **Deploy:** Cloudflare **Workers** project via Workers Builds — NOT Pages (Pages
  runs a different pipeline, ignores `wrangler.jsonc`, and fails looking for
  `.vercel/output/static`). Production branch `main`; build cmd
  `npx opennextjs-cloudflare build`, deploy cmd `npx opennextjs-cloudflare deploy`.
  `wrangler.jsonc` (committed D1 `database_id`) is the source of truth.
- **Secrets:** `TMDB_API_KEY` / `RAWG_API_KEY` must be encrypted **Secrets** on the
  Worker, not plaintext vars — `wrangler deploy` resets dashboard plaintext vars
  each deploy (secrets persist). Read via `getEnv()` (`src/lib/db.ts`).
- **Auth/security:** no app-level auth by design — the Worker sits behind
  **Cloudflare Access** (load-bearing; verify it also covers the `*.workers.dev`
  URL). Findings + fixes live in `SECURITY.md`. Stored art URLs are validated by
  `safeImageUrl()` and platform values by `filterKnown()` (`src/lib/ids.ts`,
  `platforms.ts`); CSP/headers in `next.config.ts`; mutations gated by
  `sameOrigin()` (`src/lib/guard.ts`).
- **Metadata ids:** paste-an-id/URL resolves via `extractMediaId()` (TMDB, numeric;
  pulls the id from `/movie|tv/<id>-slug`) and `extractRawgRef()` (RAWG, slug or
  id, charset-validated) in `src/lib/ids.ts`. Games are discovered by **name** via
  RAWG (`searchRawgGames`) with a results picker; TMDB is id-based.
- Run `npm run lint` and `npx tsc --noEmit` before committing.
