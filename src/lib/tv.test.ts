import { test } from "node:test";
import assert from "node:assert/strict";
import {
  seasonFromStored,
  dedupeSeasons,
  tvOwnedSeasons,
  tvPlatforms,
  tvProviderEpisodeCounts,
  tvCompleteness,
  holdingEpisodeCount,
} from "./tv";
import type { Season, TVSeries } from "./types";

const row = (season: number, episode_count: number, episodes: string, owned_on: unknown) => ({
  season,
  episode_count,
  episodes,
  owned_on: typeof owned_on === "string" ? owned_on : JSON.stringify(owned_on),
});

const series = (seasons: Season[]): TVSeries => ({
  id: 1,
  tmdb_id: null,
  series: "Test",
  year: 2008,
  poster_url: null,
  director: null,
  user_score: null,
  overview: null,
  needs_review: false,
  note: null,
  seasons,
});

// ---- seasonFromStored (the backward-compatible up-convert) ----------------
test("up-convert: legacy 'all' + platform list", () => {
  const s = seasonFromStored(row(1, 7, "all", ["Apple TV"]));
  assert.equal(s.owned, true);
  assert.deepEqual(s.owned_on, [{ platform: "Apple TV", episodes: "all" }]);
});

test("up-convert: legacy specific episodes apply to every platform", () => {
  const s = seasonFromStored(row(2, 13, JSON.stringify([1, 2]), ["Apple TV", "YouTube"]));
  assert.deepEqual(s.owned_on, [
    { platform: "Apple TV", episodes: [1, 2] },
    { platform: "YouTube", episodes: [1, 2] },
  ]);
});

test("up-convert: legacy owned-but-no-platform stays owned (source unspecified)", () => {
  const s = seasonFromStored(row(3, 13, "all", []));
  assert.equal(s.owned, true);
  assert.deepEqual(s.owned_on, []);
});

test("up-convert: unowned season", () => {
  const s = seasonFromStored(row(4, 13, "unowned", []));
  assert.equal(s.owned, false);
  assert.deepEqual(s.owned_on, []);
});

test("up-convert: new holdings shape passes through, drops bad entries", () => {
  const s = seasonFromStored(
    row(1, 7, "all", [
      { platform: "Apple TV", episodes: "all" },
      { platform: "YouTube", episodes: [1] },
      { episodes: [2] }, // no platform -> dropped
      { platform: "", episodes: "all" }, // empty platform -> dropped
    ])
  );
  assert.deepEqual(s.owned_on, [
    { platform: "Apple TV", episodes: "all" },
    { platform: "YouTube", episodes: [1] },
  ]);
});

// ---- derived helpers ------------------------------------------------------
test("holdingEpisodeCount", () => {
  assert.equal(holdingEpisodeCount({ platform: "x", episodes: "all" }, 13), 13);
  assert.equal(holdingEpisodeCount({ platform: "x", episodes: [1, 2, 3] }, 13), 3);
});

test("tvProviderEpisodeCounts: per-platform totals (Breaking Bad case)", () => {
  const t = series([
    { season: 1, episode_count: 7, owned: true, owned_on: [
      { platform: "Apple TV", episodes: "all" },
      { platform: "YouTube", episodes: [1] },
    ] },
    { season: 2, episode_count: 13, owned: true, owned_on: [{ platform: "Apple TV", episodes: "all" }] },
    { season: 3, episode_count: 13, owned: false, owned_on: [] },
  ]);
  assert.deepEqual(tvProviderEpisodeCounts(t), { "Apple TV": 20, YouTube: 1 });
  assert.deepEqual(tvPlatforms(t).sort(), ["Apple TV", "YouTube"]);
  assert.equal(tvOwnedSeasons(t).length, 2);
});

test("tvCompleteness: partial when a holding is specific or seasons missing", () => {
  const allComplete = series([
    { season: 1, episode_count: 7, owned: true, owned_on: [{ platform: "Apple TV", episodes: "all" }] },
  ]);
  assert.equal(tvCompleteness(allComplete), "complete");

  const partialEps = series([
    { season: 1, episode_count: 7, owned: true, owned_on: [{ platform: "YouTube", episodes: [1] }] },
  ]);
  assert.equal(tvCompleteness(partialEps), "partial");

  const missingSeason = series([
    { season: 1, episode_count: 7, owned: true, owned_on: [{ platform: "Apple TV", episodes: "all" }] },
    { season: 2, episode_count: 13, owned: false, owned_on: [] },
  ]);
  assert.equal(tvCompleteness(missingSeason), "partial");
});

// ---- dedupe ---------------------------------------------------------------
test("dedupeSeasons: merges duplicate season numbers, unions holdings", () => {
  const out = dedupeSeasons([
    { season: 1, episode_count: 7, owned: true, owned_on: [{ platform: "Apple TV", episodes: [1, 2] }] },
    { season: 1, episode_count: 7, owned: true, owned_on: [
      { platform: "Apple TV", episodes: [2, 3] },
      { platform: "YouTube", episodes: "all" },
    ] },
    { season: 2, episode_count: 13, owned: true, owned_on: [{ platform: "Apple TV", episodes: "all" }] },
  ]);
  assert.equal(out.length, 2);
  const s1 = out.find((s) => s.season === 1)!;
  assert.deepEqual(s1.owned_on, [
    { platform: "Apple TV", episodes: [1, 2, 3] },
    { platform: "YouTube", episodes: "all" },
  ]);
});

test("dedupeSeasons: 'all' beats a specific list when merging a platform", () => {
  const out = dedupeSeasons([
    { season: 1, episode_count: 7, owned: true, owned_on: [{ platform: "Apple TV", episodes: [1] }] },
    { season: 1, episode_count: 7, owned: true, owned_on: [{ platform: "Apple TV", episodes: "all" }] },
  ]);
  assert.deepEqual(out[0].owned_on, [{ platform: "Apple TV", episodes: "all" }]);
});
