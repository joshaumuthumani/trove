/* Trove — TMDB metadata fetch (server-side). Returns normalized title/year/art.
   Poster art is a full cached URL we persist to D1 so page loads never hit TMDB. */
import "server-only";
import { getEnv } from "./db";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export interface TmdbMovieMeta {
  title: string;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  user_score: number | null;
  overview: string | null;
}
export interface TmdbSeasonMeta {
  season: number;
  episode_count: number;
}
export interface TmdbTVMeta {
  title: string;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  user_score: number | null;
  overview: string | null;
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
// TMDB vote_average is 0–10; keep one decimal, and treat 0 (no votes yet) as null.
const scoreOf = (v?: number | null) => (typeof v === "number" && v > 0 ? Math.round(v * 10) / 10 : null);
const names = (people?: { name?: string }[]) => {
  const list = (people || []).map((p) => p?.name).filter((n): n is string => !!n);
  return list.length ? Array.from(new Set(list)).join(", ") : null;
};

export async function fetchTmdbMovie(id: string | number): Promise<TmdbMovieMeta> {
  // append_to_response=credits pulls the crew so we can extract the director(s).
  const d = await tmdb<{
    title: string;
    release_date?: string;
    poster_path?: string | null;
    vote_average?: number;
    overview?: string;
    credits?: { crew?: { job?: string; name?: string }[] };
  }>(`/movie/${encodeURIComponent(String(id))}?append_to_response=credits`);
  const director = names((d.credits?.crew || []).filter((c) => c.job === "Director"));
  return {
    title: d.title,
    year: yearOf(d.release_date),
    poster_url: posterOf(d.poster_path),
    director,
    user_score: scoreOf(d.vote_average),
    overview: d.overview?.trim() || null,
  };
}

export async function fetchTmdbTV(id: string | number): Promise<TmdbTVMeta> {
  const d = await tmdb<{
    name: string;
    first_air_date?: string;
    poster_path?: string | null;
    vote_average?: number;
    overview?: string;
    created_by?: { name?: string }[];
    seasons?: { season_number: number; episode_count: number }[];
  }>(`/tv/${encodeURIComponent(String(id))}`);
  const seasons = (d.seasons || [])
    .filter((s) => s.season_number >= 1) // drop "Specials" (season 0)
    .map((s) => ({ season: s.season_number, episode_count: s.episode_count }));
  return {
    title: d.name,
    year: yearOf(d.first_air_date),
    poster_url: posterOf(d.poster_path),
    director: names(d.created_by), // series have creators, not a single director
    user_score: scoreOf(d.vote_average),
    overview: d.overview?.trim() || null,
    seasons,
  };
}
