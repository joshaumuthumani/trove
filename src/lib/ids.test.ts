import { test } from "node:test";
import assert from "node:assert/strict";
import { extractMediaId, extractRawgRef, extractTraktRef, safeImageUrl } from "./ids";

test("extractMediaId: TMDB urls, slugs, bare ids", () => {
  assert.equal(extractMediaId("https://www.themoviedb.org/movie/530915-1917?language=en-US"), "530915");
  assert.equal(extractMediaId("530915-1917"), "530915");
  assert.equal(extractMediaId("530915"), "530915");
  assert.equal(extractMediaId("https://www.themoviedb.org/movie/414906"), "414906");
  assert.equal(extractMediaId("themoviedb.org/tv/1399-game-of-thrones"), "1399");
  assert.equal(extractMediaId("rawg.io/games/28568-elden-ring"), "28568");
  assert.equal(extractMediaId("abc123def"), "123"); // fallback: first number
});

test("extractMediaId: no id", () => {
  assert.equal(extractMediaId(""), null);
  assert.equal(extractMediaId("no numbers here"), null);
});

test("extractRawgRef: slug urls, ids, traversal rejection", () => {
  assert.equal(extractRawgRef("https://rawg.io/games/shadows-die-twice"), "shadows-die-twice");
  assert.equal(extractRawgRef("rawg.io/games/elden-ring?ref=x"), "elden-ring");
  assert.equal(extractRawgRef("28568"), "28568");
  assert.equal(extractRawgRef("shadows-die-twice"), "shadows-die-twice");
  assert.equal(extractRawgRef("rawg.io/games/../../etc"), null);
  assert.equal(extractRawgRef("foo/bar"), null);
  assert.equal(extractRawgRef(""), null);
});

test("extractTraktRef: show urls, slugs, imdb ids", () => {
  assert.equal(extractTraktRef("https://trakt.tv/shows/futurama"), "futurama");
  assert.equal(extractTraktRef("trakt.tv/shows/the-flash-2014/seasons/1"), "the-flash-2014");
  assert.equal(extractTraktRef("futurama"), "futurama");
  assert.equal(extractTraktRef("tt1661470"), "tt1661470");
  assert.equal(extractTraktRef("../etc"), null);
  assert.equal(extractTraktRef(""), null);
});

test("safeImageUrl: only https TMDB/RAWG hosts pass", () => {
  assert.equal(safeImageUrl("https://image.tmdb.org/t/p/w500/a.jpg"), "https://image.tmdb.org/t/p/w500/a.jpg");
  assert.equal(safeImageUrl("https://media.rawg.io/media/games/x.jpg"), "https://media.rawg.io/media/games/x.jpg");
});

test("safeImageUrl: rejects bad scheme/host/garbage", () => {
  assert.equal(safeImageUrl("javascript:alert(1)"), null);
  assert.equal(safeImageUrl("http://image.tmdb.org/a.jpg"), null); // not https
  assert.equal(safeImageUrl("https://evil.com/a.jpg"), null);
  assert.equal(safeImageUrl("data:image/png;base64,AAAA"), null);
  assert.equal(safeImageUrl("not a url"), null);
  assert.equal(safeImageUrl(null), null);
  assert.equal(safeImageUrl(undefined), null);
  assert.equal(safeImageUrl(42), null);
  assert.equal(safeImageUrl(""), null);
});
