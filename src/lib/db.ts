/* Trove — D1 access + row<->app mappers.
   Reads run from RSC; writes from route handlers. Both resolve the binding via
   getCloudflareContext() (works under `next dev` thanks to
   initOpenNextCloudflareForDev() in next.config.ts). */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Movie, TVSeries, Season, SeasonHolding, OwnedEpisodes, Game } from "./types";
import { dedupeSeasons } from "./tv";

export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as CloudflareEnv;
}

export async function getDb(): Promise<D1Database> {
  return (await getEnv()).DB;
}

function parseJsonArr<T = string>(s: unknown): T[] {
  if (Array.isArray(s)) return s as T[];
  try {
    const v = JSON.parse((s as string) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// ---- row shapes (raw D1) -------------------------------------------------
export interface MovieRow {
  id: number;
  tmdb_id: number | null;
  title: string;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  user_score: number | null;
  overview: string | null;
  digital: string;
  physical: string;
  needs_review: number;
  date_added?: string;
}
export interface SeriesRow {
  id: number;
  tmdb_id: number | null;
  series: string;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  user_score: number | null;
  overview: string | null;
  note: string | null;
  needs_review: number;
  date_added?: string;
}
export interface SeasonRow {
  id: number;
  series_id: number;
  season: number;
  episode_count: number;
  episodes: string;
  owned_on: string;
}
export interface GameRow {
  id: number;
  rawg_id: number | null;
  title: string;
  year: number | null;
  cover_url: string | null;
  platforms: string;
  needs_tagging: number;
  date_added?: string;
}

// ---- mappers -------------------------------------------------------------
export function mapMovie(r: MovieRow): Movie {
  return {
    id: r.id,
    tmdb_id: r.tmdb_id,
    title: r.title,
    year: r.year,
    poster_url: r.poster_url,
    director: r.director ?? null,
    user_score: r.user_score ?? null,
    overview: r.overview ?? null,
    digital: parseJsonArr(r.digital),
    physical: parseJsonArr(r.physical),
    needs_review: !!r.needs_review,
    date_added: r.date_added,
  };
}

const normEpisodes = (e: unknown): OwnedEpisodes =>
  Array.isArray(e) ? (e as unknown[]).map(Number).filter((n) => Number.isFinite(n) && n >= 1) : "all";

// Up-convert both shapes to per-platform holdings:
//  - new: owned_on is [{platform, episodes}]
//  - old: owned_on is ["Apple TV", ...] + a season-level `episodes` column, so
//    every platform inherits that episode set. Keeps existing rows working with
//    no destructive migration; new shape is written on the next save.
export function mapSeason(r: SeasonRow): Season {
  const owned = r.episodes !== "unowned";
  const raw = parseJsonArr<unknown>(r.owned_on);
  let owned_on: SeasonHolding[] = [];
  if (raw.length && typeof raw[0] === "object" && raw[0] !== null) {
    owned_on = (raw as { platform?: unknown; episodes?: unknown }[])
      .filter((h) => h && typeof h.platform === "string" && h.platform)
      .map((h) => ({ platform: h.platform as string, episodes: normEpisodes(h.episodes) }));
  } else {
    const seasonEps: OwnedEpisodes =
      r.episodes === "all" || r.episodes === "unowned" ? "all" : normEpisodes(parseJsonArr<number>(r.episodes));
    owned_on = (raw as unknown[])
      .filter((p): p is string => typeof p === "string" && !!p)
      .map((p) => ({ platform: p, episodes: seasonEps }));
  }
  return { id: r.id, series_id: r.series_id, season: r.season, episode_count: r.episode_count, owned, owned_on };
}

export function mapSeries(r: SeriesRow, seasons: Season[]): TVSeries {
  return {
    id: r.id,
    tmdb_id: r.tmdb_id,
    series: r.series,
    year: r.year,
    poster_url: r.poster_url,
    director: r.director ?? null,
    user_score: r.user_score ?? null,
    overview: r.overview ?? null,
    note: r.note,
    needs_review: !!r.needs_review,
    seasons: dedupeSeasons(seasons),
    date_added: r.date_added,
  };
}

export function mapGame(r: GameRow): Game {
  return {
    id: r.id,
    rawg_id: r.rawg_id,
    title: r.title,
    year: r.year,
    cover_url: r.cover_url,
    platforms: parseJsonArr(r.platforms),
    needs_tagging: !!r.needs_tagging,
    date_added: r.date_added,
  };
}
