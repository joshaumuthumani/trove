import { test } from "node:test";
import assert from "node:assert/strict";
import { titleSortKey, buildMovieRows, buildTVRows } from "./catalog";
import type { Movie, TVSeries } from "./types";

test("titleSortKey: strips leading A/An/The (only when followed by a space)", () => {
  assert.equal(titleSortKey("The Matrix"), "matrix");
  assert.equal(titleSortKey("An American Tail"), "american tail");
  assert.equal(titleSortKey("A Quiet Place"), "quiet place");
  assert.equal(titleSortKey("Avatar"), "avatar");
  assert.equal(titleSortKey("Andor"), "andor");
  assert.equal(titleSortKey("Theory of Everything"), "theory of everything");
  assert.equal(titleSortKey("A.I."), "a.i.");
  assert.equal(titleSortKey("The Office"), "office");
});

const movie = (id: number, title: string, extra: Partial<Movie> = {}): Movie => ({
  id,
  tmdb_id: null,
  title,
  year: 2000 + id,
  poster_url: null,
  director: null,
  user_score: null,
  overview: null,
  digital: [],
  physical: [],
  needs_review: false,
  ...extra,
});

test("buildMovieRows: title sort ignores articles", () => {
  const rows = buildMovieRows([movie(1, "The Matrix"), movie(2, "Avatar"), movie(3, "An Apple")], { sort: "title" });
  assert.deepEqual(rows.map((r) => r.title), ["An Apple", "Avatar", "The Matrix"]);
});

test("buildMovieRows: descending title sort", () => {
  const rows = buildMovieRows([movie(1, "The Matrix"), movie(2, "Avatar"), movie(3, "An Apple")], { sort: "title", dir: "desc" });
  assert.deepEqual(rows.map((r) => r.title), ["The Matrix", "Avatar", "An Apple"]);
});

test("buildMovieRows: platform filter + needs_review flag", () => {
  const movies = [
    movie(1, "Owned Apple", { digital: ["Apple TV"] }),
    movie(2, "Owned Disc", { physical: ["DVD"] }),
    movie(3, "Flagged", { needs_review: true, digital: ["Apple TV"] }),
  ];
  assert.deepEqual(buildMovieRows(movies, { plat: "Apple TV" }).map((r) => r.id).sort(), [1, 3]);
  assert.deepEqual(buildMovieRows(movies, { flag: "1" }).map((r) => r.id), [3]);
  assert.deepEqual(buildMovieRows(movies, { q: "disc" }).map((r) => r.id), [2]);
});

const tv = (id: number, name: string, seasons: TVSeries["seasons"]): TVSeries => ({
  id,
  tmdb_id: null,
  series: name,
  year: 2000 + id,
  poster_url: null,
  director: null,
  user_score: null,
  overview: null,
  needs_review: false,
  note: null,
  seasons,
});

test("buildTVRows: carries per-provider episode counts and ignores article in sort", () => {
  const shows = [
    tv(1, "The Wire", [{ season: 1, episode_count: 13, owned: true, owned_on: [{ platform: "Apple TV", episodes: "all" }] }]),
    tv(2, "Andor", [{ season: 1, episode_count: 12, owned: true, owned_on: [{ platform: "YouTube", episodes: [1] }] }]),
  ];
  const rows = buildTVRows(shows, { sort: "title" });
  assert.deepEqual(rows.map((r) => r.title), ["Andor", "The Wire"]); // wire sorts under W
  const wire = rows.find((r) => r.title === "The Wire")!;
  assert.deepEqual(wire.chipCounts, { "Apple TV": 13 });
  assert.equal(wire.owned, 1);
});
