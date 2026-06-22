import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { igdbCoverUrl, mapIgdbGames, getIgdbToken, _resetTokenCache } from "./igdb";

afterEach(() => _resetTokenCache());

test("igdbCoverUrl: builds cover-big URL or null", () => {
  assert.equal(igdbCoverUrl("co2ad3"), "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ad3.jpg");
  assert.equal(igdbCoverUrl(null), null);
  assert.equal(igdbCoverUrl(undefined), null);
  assert.equal(igdbCoverUrl(""), null);
});

test("mapIgdbGames: maps name/year/cover, drops invalid entries", () => {
  const out = mapIgdbGames([
    { id: 1, name: "Control", first_release_date: 1546300800, cover: { image_id: "co2ad3" } }, // 2019
    { id: 2, name: "No Cover" }, // no cover, no date
    { id: 3 }, // no name -> dropped
    { name: "No id" }, // no id -> dropped
    null,
  ]);
  assert.deepEqual(out, [
    { id: 1, title: "Control", year: 2019, cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ad3.jpg" },
    { id: 2, title: "No Cover", year: null, cover_url: null },
  ]);
});

test("mapIgdbGames: non-array input -> []", () => {
  assert.deepEqual(mapIgdbGames(null), []);
  assert.deepEqual(mapIgdbGames(undefined), []);
  assert.deepEqual(mapIgdbGames({}), []);
});

test("getIgdbToken: caches within expiry, refetches after", async () => {
  let calls = 0;
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => {
    calls++;
    return { ok: true, json: async () => ({ access_token: `T${calls}`, expires_in: 3600 }) } as Response;
  }) as typeof fetch;
  try {
    const t0 = 1_000_000;
    assert.equal(await getIgdbToken("id", "secret", t0), "T1");
    assert.equal(await getIgdbToken("id", "secret", t0 + 1000), "T1"); // cached
    assert.equal(calls, 1);
    // Past expiry (3600s later) -> refetch
    assert.equal(await getIgdbToken("id", "secret", t0 + 3_600_000), "T2");
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = orig;
  }
});

test("getIgdbToken: throws on non-OK Twitch response", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => ({ ok: false, status: 401, json: async () => ({}) }) as Response) as typeof fetch;
  try {
    await assert.rejects(() => getIgdbToken("id", "bad"), /Twitch 401/);
  } finally {
    globalThis.fetch = orig;
  }
});
