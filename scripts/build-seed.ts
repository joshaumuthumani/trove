/* Trove — build seed JSON from the prototype's data.js sample.
   One-off transform: db/source/prototype-data.js -> db/seed/{movies,tv,games}.json
   in the exact shape the D1 tables expect. When the real Excel data arrives,
   regenerate these JSON files (same shape) and re-run the seed; no app changes. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "db/source/prototype-data.js");
const OUT = path.join(ROOT, "db/seed");

interface ProtoSeason {
  season: number;
  episode_count: number;
  owned_on: string[];
  episodes: "all" | "unowned" | number[];
}
interface ProtoData {
  movies: { id: number; tmdb_id: number; title: string; year: number; digital: string[]; physical: string[]; needs_review: number }[];
  tv: { id: number; tmdb_id: number; series: string; year: number; seasons: ProtoSeason[]; note?: string }[];
  games: { id: number; rawg_id: number; title: string; year: number; platforms: { service: string; format: string }[]; needs_tagging: number }[];
}

const code = fs.readFileSync(SRC, "utf8");
const sandbox: { window: { TROVE_DATA?: ProtoData } } = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const D = sandbox.window.TROVE_DATA;
if (!D) throw new Error("Could not load window.TROVE_DATA from prototype-data.js");

const movies = D.movies.map((m) => ({
  id: m.id,
  tmdb_id: m.tmdb_id ?? null,
  title: m.title,
  year: m.year ?? null,
  poster_url: null,
  digital: m.digital || [],
  physical: m.physical || [],
  needs_review: m.needs_review ? 1 : 0,
}));

const tvSeries: Record<string, unknown>[] = [];
const tvSeasons: Record<string, unknown>[] = [];
D.tv.forEach((t) => {
  tvSeries.push({
    id: t.id,
    tmdb_id: t.tmdb_id ?? null,
    series: t.series,
    year: t.year ?? null,
    poster_url: null,
    note: t.note ?? null,
    needs_review: 0,
  });
  const seenSeasons = new Set<number>();
  t.seasons.forEach((s) => {
    if (seenSeasons.has(s.season)) return; // prototype data lists some seasons twice
    seenSeasons.add(s.season);
    tvSeasons.push({
      series_id: t.id,
      season: s.season,
      episode_count: s.episode_count,
      episodes: s.episodes, // "all" | "unowned" | number[]
      owned_on: s.owned_on || [],
    });
  });
});

const games = D.games.map((g) => ({
  id: g.id,
  rawg_id: g.rawg_id ?? null,
  title: g.title,
  year: g.year ?? null,
  cover_url: null,
  platforms: g.platforms || [],
  needs_tagging: g.needs_tagging ? 1 : 0,
}));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "movies.json"), JSON.stringify(movies, null, 2));
fs.writeFileSync(path.join(OUT, "tv.json"), JSON.stringify({ series: tvSeries, seasons: tvSeasons }, null, 2));
fs.writeFileSync(path.join(OUT, "games.json"), JSON.stringify(games, null, 2));

console.log(
  `Seed built: ${movies.length} movies, ${tvSeries.length} series / ${tvSeasons.length} seasons, ${games.length} games.`
);
