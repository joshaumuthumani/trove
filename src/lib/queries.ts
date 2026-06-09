/* Trove — D1 read queries for Server Components.
   Data volumes are small (hundreds of rows), so list endpoints load all rows
   (+ seasons) and hand off to catalog.ts for filter/sort/search in JS. */
import "server-only";
import {
  getDb,
  mapMovie,
  mapSeries,
  mapSeason,
  mapGame,
  type MovieRow,
  type SeriesRow,
  type SeasonRow,
  type GameRow,
} from "./db";
import type { Movie, TVSeries, Game } from "./types";

export async function getAllMovies(): Promise<Movie[]> {
  const db = await getDb();
  const { results } = await db.prepare("SELECT * FROM movies").all<MovieRow>();
  return (results || []).map(mapMovie);
}

export async function getMovie(id: number): Promise<Movie | null> {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM movies WHERE id = ?").bind(id).first<MovieRow>();
  return row ? mapMovie(row) : null;
}

export async function getAllTV(): Promise<TVSeries[]> {
  const db = await getDb();
  const [{ results: series }, { results: seasons }] = await db.batch<SeriesRow | SeasonRow>([
    db.prepare("SELECT * FROM tv_series"),
    db.prepare("SELECT * FROM tv_seasons"),
  ]);
  const byseries = new Map<number, ReturnType<typeof mapSeason>[]>();
  (seasons as SeasonRow[] | undefined)?.forEach((r) => {
    const arr = byseries.get(r.series_id) || [];
    arr.push(mapSeason(r));
    byseries.set(r.series_id, arr);
  });
  return (series as SeriesRow[] | undefined || []).map((s) => mapSeries(s, byseries.get(s.id) || []));
}

export async function getTV(id: number): Promise<TVSeries | null> {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM tv_series WHERE id = ?").bind(id).first<SeriesRow>();
  if (!row) return null;
  const { results } = await db
    .prepare("SELECT * FROM tv_seasons WHERE series_id = ?")
    .bind(id)
    .all<SeasonRow>();
  return mapSeries(row, (results || []).map(mapSeason));
}

export async function getAllGames(): Promise<Game[]> {
  const db = await getDb();
  const { results } = await db.prepare("SELECT * FROM games").all<GameRow>();
  return (results || []).map(mapGame);
}

export async function getGame(id: number): Promise<Game | null> {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM games WHERE id = ?").bind(id).first<GameRow>();
  return row ? mapGame(row) : null;
}

export async function getCounts(): Promise<{ movies: number; tv: number; seasons: number; games: number }> {
  const db = await getDb();
  const [m, t, s, g] = await db.batch<{ n: number }>([
    db.prepare("SELECT COUNT(*) AS n FROM movies"),
    db.prepare("SELECT COUNT(*) AS n FROM tv_series"),
    db.prepare("SELECT COUNT(*) AS n FROM tv_seasons"),
    db.prepare("SELECT COUNT(*) AS n FROM games"),
  ]);
  return {
    movies: m.results?.[0]?.n ?? 0,
    tv: t.results?.[0]?.n ?? 0,
    seasons: s.results?.[0]?.n ?? 0,
    games: g.results?.[0]?.n ?? 0,
  };
}

export interface ArtPick {
  title: string;
  poster_url: string | null;
}

/** A few representative covers per catalog for the launchpad card flourishes. */
export async function getLaunchpadArt(n = 6): Promise<{ movies: ArtPick[]; tv: ArtPick[]; games: ArtPick[] }> {
  const db = await getDb();
  const [m, t, g] = await db.batch<ArtPick>([
    db.prepare("SELECT title, poster_url FROM movies LIMIT ?").bind(n),
    db.prepare("SELECT series AS title, poster_url FROM tv_series LIMIT ?").bind(n),
    db.prepare("SELECT title, cover_url AS poster_url FROM games LIMIT ?").bind(n),
  ]);
  return {
    movies: m.results || [],
    tv: t.results || [],
    games: g.results || [],
  };
}

export interface SearchResult {
  type: "movie" | "tv" | "game";
  id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  kind: "film" | "tv" | "game";
}

/** Cross-catalog type-ahead used by the global search. */
export async function searchAll(q: string, limit = 8): Promise<SearchResult[]> {
  const s = q.trim();
  if (!s) return [];
  const db = await getDb();
  const like = `%${s.replace(/[%_]/g, (c) => "\\" + c)}%`;
  const [movies, tv, games] = await db.batch([
    db.prepare("SELECT id, title, year, poster_url FROM movies WHERE title LIKE ?1 ESCAPE '\\' LIMIT ?2").bind(like, limit),
    db.prepare("SELECT id, series AS title, year, poster_url FROM tv_series WHERE series LIKE ?1 ESCAPE '\\' LIMIT ?2").bind(like, limit),
    db.prepare("SELECT id, title, year, cover_url AS poster_url FROM games WHERE title LIKE ?1 ESCAPE '\\' LIMIT ?2").bind(like, limit),
  ]);
  type Row = { id: number; title: string; year: number | null; poster_url: string | null };
  const out: SearchResult[] = [];
  (movies.results as Row[] | undefined)?.forEach((r) => out.push({ type: "movie", kind: "film", ...r }));
  (tv.results as Row[] | undefined)?.forEach((r) => out.push({ type: "tv", kind: "tv", ...r }));
  (games.results as Row[] | undefined)?.forEach((r) => out.push({ type: "game", kind: "game", ...r }));
  return out.slice(0, limit);
}
