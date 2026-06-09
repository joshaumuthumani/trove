/* Trove — TMDB metadata fetch (server-side). Returns normalized title/year/art.
   Poster art is a full cached URL we persist to D1 so page loads never hit TMDB. */
import "server-only";
import { getEnv } from "./db";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export interface TmdbMovieMeta {
  title: string;
  year: number | null;
  poster_url: string | null;
}
export interface TmdbSeasonMeta {
  season: number;
  episode_count: number;
}
export interface TmdbTVMeta {
  title: string;
  year: number | null;
  poster_url: string | null;
  seasons: TmdbSeasonMeta[];
}

async function tmdb<T>(pathAndQuery: string): Promise<T> {
  const { TMDB_API_KEY } = await getEnv();
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is not configured");
  const sep = pathAndQuery.includes("?") ? "&" : "?";
  const res = await fetch(`https://api.themoviedb.org/3${pathAndQuery}${sep}api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return (await res.json()) as T;
}

const yearOf = (d?: string) => (d && d.length >= 4 ? parseInt(d.slice(0, 4), 10) : null);
const posterOf = (p?: string | null) => (p ? IMG_BASE + p : null);

export async function fetchTmdbMovie(id: string | number): Promise<TmdbMovieMeta> {
  const d = await tmdb<{ title: string; release_date?: string; poster_path?: string | null }>(`/movie/${id}`);
  return { title: d.title, year: yearOf(d.release_date), poster_url: posterOf(d.poster_path) };
}

export async function fetchTmdbTV(id: string | number): Promise<TmdbTVMeta> {
  const d = await tmdb<{
    name: string;
    first_air_date?: string;
    poster_path?: string | null;
    seasons?: { season_number: number; episode_count: number }[];
  }>(`/tv/${id}`);
  const seasons = (d.seasons || [])
    .filter((s) => s.season_number >= 1) // drop "Specials" (season 0)
    .map((s) => ({ season: s.season_number, episode_count: s.episode_count }));
  return { title: d.name, year: yearOf(d.first_air_date), poster_url: posterOf(d.poster_path), seasons };
}
