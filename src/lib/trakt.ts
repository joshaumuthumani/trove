/* Trove — Trakt season fetch (server-side). On-demand augment source for shows
   where TMDB under-reports seasons; Trakt is TVDB-backed and often more complete.
   Public endpoint — only the api-key (app client_id) + version headers, no OAuth.
   Trakt returns no usable artwork, so this is metadata-only; art stays TMDB. */
import "server-only";
import { getEnv } from "./db";

export interface TraktSeason {
  season: number;
  episode_count: number;
}

export async function fetchTraktSeasons(ref: string): Promise<TraktSeason[]> {
  const { TRAKT_API_KEY } = await getEnv();
  if (!TRAKT_API_KEY) throw new Error("TRAKT_API_KEY is not configured");
  const res = await fetch(`https://api.trakt.tv/shows/${encodeURIComponent(ref)}/seasons?extended=full`, {
    headers: {
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_API_KEY,
      "Content-Type": "application/json",
      // Trakt is fronted by Cloudflare and can 403 requests with no UA.
      "User-Agent": "Trove/1.0 (+https://github.com/joshaumuthumani/trove)",
    },
  });
  if (!res.ok) throw new Error(`Trakt ${res.status}`);
  const d = (await res.json()) as { number: number; episode_count?: number; aired_episodes?: number }[];
  return (d || [])
    .filter((s) => s.number >= 1) // drop Specials (season 0)
    .map((s) => ({ season: s.number, episode_count: s.episode_count ?? s.aired_episodes ?? 0 }))
    .sort((a, b) => a.season - b.season);
}
