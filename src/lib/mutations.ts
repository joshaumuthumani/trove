/* Trove — D1 write helpers (create / update / delete). Used by route handlers. */
import "server-only";
import { getDb } from "./db";
import type { Season, GamePlatform } from "./types";

const arr = (a: unknown) => JSON.stringify(Array.isArray(a) ? a : []);

// ---- movies --------------------------------------------------------------
export interface MovieInput {
  tmdb_id: number | null;
  title: string;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  user_score: number | null;
  overview: string | null;
  digital: string[];
  physical: string[];
  needs_review?: boolean;
}

export async function createMovie(m: MovieInput): Promise<number> {
  const db = await getDb();
  const res = await db
    .prepare(
      "INSERT INTO movies (tmdb_id,title,year,poster_url,director,user_score,overview,digital,physical,needs_review) VALUES (?,?,?,?,?,?,?,?,?,?)"
    )
    .bind(m.tmdb_id, m.title, m.year, m.poster_url, m.director, m.user_score, m.overview, arr(m.digital), arr(m.physical), m.needs_review ? 1 : 0)
    .run();
  return Number(res.meta.last_row_id);
}

export async function updateMovie(id: number, m: MovieInput): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      "UPDATE movies SET tmdb_id=?,title=?,year=?,poster_url=?,director=?,user_score=?,overview=?,digital=?,physical=?,needs_review=? WHERE id=?"
    )
    .bind(m.tmdb_id, m.title, m.year, m.poster_url, m.director, m.user_score, m.overview, arr(m.digital), arr(m.physical), m.needs_review ? 1 : 0, id)
    .run();
}

// ---- tv -------------------------------------------------------------------
export interface TVInput {
  tmdb_id: number | null;
  series: string;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  user_score: number | null;
  overview: string | null;
  note: string | null;
  seasons: Season[];
}

// `episodes` column now just records season-level ownership ("all"/"unowned");
// per-platform episode detail lives in owned_on as [{platform, episodes}].
function seasonStmts(db: D1Database, seriesId: number, seasons: Season[]) {
  return seasons.map((s) =>
    db
      .prepare("INSERT INTO tv_seasons (series_id,season,episode_count,episodes,owned_on) VALUES (?,?,?,?,?)")
      .bind(seriesId, s.season, s.episode_count, s.owned ? "all" : "unowned", arr(s.owned_on))
  );
}

export async function createTV(t: TVInput): Promise<number> {
  const db = await getDb();
  const res = await db
    .prepare("INSERT INTO tv_series (tmdb_id,series,year,poster_url,director,user_score,overview,note) VALUES (?,?,?,?,?,?,?,?)")
    .bind(t.tmdb_id, t.series, t.year, t.poster_url, t.director, t.user_score, t.overview, t.note)
    .run();
  const id = Number(res.meta.last_row_id);
  const stmts = seasonStmts(db, id, t.seasons);
  if (stmts.length) await db.batch(stmts);
  return id;
}

export async function updateTV(id: number, t: TVInput): Promise<void> {
  const db = await getDb();
  // One batch = one transaction, so the season replace can't half-apply.
  await db.batch([
    db
      .prepare("UPDATE tv_series SET tmdb_id=?,series=?,year=?,poster_url=?,director=?,user_score=?,overview=?,note=? WHERE id=?")
      .bind(t.tmdb_id, t.series, t.year, t.poster_url, t.director, t.user_score, t.overview, t.note, id),
    db.prepare("DELETE FROM tv_seasons WHERE series_id=?").bind(id),
    ...seasonStmts(db, id, t.seasons),
  ]);
}

// ---- games ----------------------------------------------------------------
export interface GameInput {
  rawg_id: number | null;
  title: string;
  year: number | null;
  cover_url: string | null;
  platforms: GamePlatform[];
}

export async function createGame(g: GameInput): Promise<number> {
  const db = await getDb();
  const clean = (g.platforms || []).filter((e) => e.service);
  const res = await db
    .prepare("INSERT INTO games (rawg_id,title,year,cover_url,platforms,needs_tagging) VALUES (?,?,?,?,?,?)")
    .bind(g.rawg_id, g.title, g.year, g.cover_url, JSON.stringify(clean), clean.length === 0 ? 1 : 0)
    .run();
  return Number(res.meta.last_row_id);
}

export async function updateGame(id: number, g: GameInput): Promise<void> {
  const db = await getDb();
  const clean = (g.platforms || []).filter((e) => e.service);
  await db
    .prepare("UPDATE games SET rawg_id=?,title=?,year=?,cover_url=?,platforms=?,needs_tagging=? WHERE id=?")
    .bind(g.rawg_id, g.title, g.year, g.cover_url, JSON.stringify(clean), clean.length === 0 ? 1 : 0, id)
    .run();
}

// ---- delete ---------------------------------------------------------------
// Fixed per-table statements (no string interpolation into SQL) keyed by a typed
// table name, with a runtime guard so an unexpected key can never build a query.
const DELETE_SQL: Record<"movies" | "tv_series" | "games", string> = {
  movies: "DELETE FROM movies WHERE id=?",
  tv_series: "DELETE FROM tv_series WHERE id=?",
  games: "DELETE FROM games WHERE id=?",
};

export async function deleteRow(table: "movies" | "tv_series" | "games", id: number): Promise<void> {
  const sql = DELETE_SQL[table];
  if (!sql) throw new Error("Unknown table");
  const db = await getDb();
  await db.prepare(sql).bind(id).run();
}
