/* Trove — TV derived helpers (ported from catalog.jsx). */
import type { TVSeries } from "./types";

export function tvOwnedSeasons(t: TVSeries) {
  return t.seasons.filter((s) => s.episodes !== "unowned");
}

export function tvPlatforms(t: TVSeries): string[] {
  const set = new Set<string>();
  t.seasons.forEach((s) => (s.owned_on || []).forEach((p) => set.add(p)));
  return [...set];
}

export function tvCompleteness(t: TVSeries): "partial" | "complete" {
  const owned = tvOwnedSeasons(t);
  const partialEps = owned.some((s) => Array.isArray(s.episodes));
  return owned.length < t.seasons.length || partialEps ? "partial" : "complete";
}
