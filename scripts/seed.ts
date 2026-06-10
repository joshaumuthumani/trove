/* Trove — seed D1 from db/seed/*.json.
   Generates an INSERT script (db/seed/_seed.sql) and applies it with wrangler.
   Usage: tsx scripts/seed.ts --local   (or --remote) */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(__dirname, "..");
const SEED = path.join(ROOT, "db/seed");
const target = process.argv.includes("--remote") ? "--remote" : "--local";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
};
const json = (v: unknown): string => q(JSON.stringify(v));
// number[] episodes -> JSON string; "all"/"unowned" -> literal string
const episodes = (e: unknown): string => (Array.isArray(e) ? q(JSON.stringify(e)) : q(e));

const read = (f: string) => JSON.parse(fs.readFileSync(path.join(SEED, f), "utf8"));
const movies = read("movies.json");
const tv = read("tv.json");
const games = read("games.json");

// No explicit BEGIN/COMMIT: remote D1 rejects SQL transaction statements over
// the HTTP API, and `wrangler d1 execute --file` already applies the whole file
// atomically (rolling back to the original state on failure).
const lines: string[] = ["PRAGMA foreign_keys = ON;"];
lines.push("DELETE FROM tv_seasons;", "DELETE FROM tv_series;", "DELETE FROM movies;", "DELETE FROM games;");

for (const m of movies) {
  lines.push(
    `INSERT INTO movies (id,tmdb_id,title,year,poster_url,digital,physical,needs_review) VALUES (${m.id},${q(
      m.tmdb_id
    )},${q(m.title)},${q(m.year)},${q(m.poster_url)},${json(m.digital)},${json(m.physical)},${m.needs_review});`
  );
}
for (const s of tv.series) {
  lines.push(
    `INSERT INTO tv_series (id,tmdb_id,series,year,poster_url,note,needs_review) VALUES (${s.id},${q(
      s.tmdb_id
    )},${q(s.series)},${q(s.year)},${q(s.poster_url)},${q(s.note)},${s.needs_review});`
  );
}
for (const s of tv.seasons) {
  lines.push(
    `INSERT INTO tv_seasons (series_id,season,episode_count,episodes,owned_on) VALUES (${s.series_id},${q(
      s.season
    )},${q(s.episode_count)},${episodes(s.episodes)},${json(s.owned_on)});`
  );
}
for (const g of games) {
  lines.push(
    `INSERT INTO games (id,rawg_id,title,year,cover_url,platforms,needs_tagging) VALUES (${g.id},${q(
      g.rawg_id
    )},${q(g.title)},${q(g.year)},${q(g.cover_url)},${json(g.platforms)},${g.needs_tagging});`
  );
}

const sqlPath = path.join(SEED, "_seed.sql");
fs.writeFileSync(sqlPath, lines.join("\n"));
console.log(`Wrote ${sqlPath} (${movies.length} movies, ${tv.series.length} series, ${tv.seasons.length} seasons, ${games.length} games). Applying ${target}…`);

execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "trove", target, `--file=${sqlPath}`, "--yes"],
  { cwd: ROOT, stdio: "inherit" }
);
