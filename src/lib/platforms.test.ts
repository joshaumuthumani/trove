import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterKnown,
  toggleDigital,
  isPhysical,
  isDigitalOnlySvc,
  normalizeGamePlatforms,
  MOVIE_DIGITAL,
  TV_PLATFORMS,
  GAME_SERVICES,
  GAME_FORMATS,
} from "./platforms";

test("filterKnown: keeps known values, drops the rest", () => {
  assert.deepEqual(filterKnown(["Apple TV", "__evil__", "YouTube"], TV_PLATFORMS), ["Apple TV", "YouTube"]);
  assert.deepEqual(filterKnown([], TV_PLATFORMS), []);
  assert.deepEqual(filterKnown("not an array", TV_PLATFORMS), []);
  assert.deepEqual(filterKnown(undefined, TV_PLATFORMS), []);
  assert.deepEqual(filterKnown([1, 2, "Steam"], GAME_SERVICES), ["Steam"]);
});

test("toggleDigital: Movies Anywhere cascades select-all / clear-all", () => {
  assert.deepEqual(toggleDigital([], "Movies Anywhere"), [...MOVIE_DIGITAL]);
  assert.deepEqual(toggleDigital([...MOVIE_DIGITAL], "Movies Anywhere"), []);
});

test("toggleDigital: other lockers are plain toggles and never flip Movies Anywhere", () => {
  assert.deepEqual(toggleDigital([], "Apple TV"), ["Apple TV"]);
  assert.deepEqual(toggleDigital(["Apple TV"], "Apple TV"), []);
  const r = toggleDigital(["Apple TV"], "YouTube");
  assert.deepEqual(r, ["Apple TV", "YouTube"]);
  assert.ok(!r.includes("Movies Anywhere"));
});

test("isPhysical / isDigitalOnlySvc", () => {
  assert.equal(isPhysical("Blu-Ray"), true);
  assert.equal(isPhysical("Ultra HD Blu-ray"), true);
  assert.equal(isPhysical("Apple TV"), false);
  assert.equal(isPhysical("YouTube"), false);
  assert.equal(isDigitalOnlySvc("Steam"), true);
  assert.equal(isDigitalOnlySvc("Epic"), true);
  assert.equal(isDigitalOnlySvc("PlayStation"), false);
});

test("vocab: YouTube is a TV source; game formats are Digital/Disc", () => {
  assert.ok(TV_PLATFORMS.includes("YouTube"));
  assert.ok(TV_PLATFORMS.includes("Apple TV"));
  assert.deepEqual([...GAME_FORMATS].sort(), ["Digital", "Disc"]);
});

test("normalizeGamePlatforms: drops unknown services, coerces bad formats to Disc", () => {
  assert.deepEqual(normalizeGamePlatforms([{ service: "Steam", format: "Digital" }, { service: "Atari", format: "Digital" }]), [
    { service: "Steam", format: "Digital" },
  ]);
  assert.deepEqual(normalizeGamePlatforms([{ service: "Steam", format: "Cartridge" }]), [{ service: "Steam", format: "Disc" }]);
  assert.deepEqual(normalizeGamePlatforms([{ service: "Steam" }]), [{ service: "Steam", format: "Disc" }]);
});

test("normalizeGamePlatforms: keeps one service in two distinct formats (Disc + Digital)", () => {
  assert.deepEqual(
    normalizeGamePlatforms([
      { service: "PlayStation", format: "Disc" },
      { service: "PlayStation", format: "Digital" },
    ]),
    [
      { service: "PlayStation", format: "Disc" },
      { service: "PlayStation", format: "Digital" },
    ]
  );
});

test("normalizeGamePlatforms: collapses exact (service, format) duplicates", () => {
  assert.deepEqual(
    normalizeGamePlatforms([
      { service: "Steam", format: "Digital" },
      { service: "Steam", format: "Digital" },
    ]),
    [{ service: "Steam", format: "Digital" }]
  );
});

test("normalizeGamePlatforms: non-array input -> []", () => {
  assert.deepEqual(normalizeGamePlatforms(undefined), []);
  assert.deepEqual(normalizeGamePlatforms("nope"), []);
});
