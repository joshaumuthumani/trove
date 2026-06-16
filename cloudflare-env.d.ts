/// <reference types="@cloudflare/workers-types" />

// Bindings & secrets available via getCloudflareContext().env.
// (Regenerate the binding portion any time with `npm run cf-typegen`.)
interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
  /** TMDB v3 API key — set in .dev.vars (local) / Pages secret (prod). */
  TMDB_API_KEY?: string;
  /** RAWG API key — set in .dev.vars (local) / Pages secret (prod). */
  RAWG_API_KEY?: string;
  /** Trakt app client_id — optional, powers on-demand season augmentation. */
  TRAKT_API_KEY?: string;
}
