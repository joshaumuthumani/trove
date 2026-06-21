/* Trove — TV derived helpers (ported from catalog.jsx). */
import type { TVSeries, Season, SeasonHolding, OwnedEpisodes } from "./types";

function mergeEpisodes(a: OwnedEpisodes, b: OwnedEpisodes): OwnedEpisodes {
  if (a === "all" || b === "all") return "all";
  return Array.from(new Set([...a, ...b])).sort((x, y) => x - y);
}

function mergeHoldings(a: SeasonHolding[], b: SeasonHolding[]): SeasonHolding[] {
  const m = new Map<string, OwnedEpisodes>();
  for (const h of [...a, ...b]) {
    const prev = m.get(h.platform);
    m.set(h.platform, prev === undefined ? h.episodes : mergeEpisodes(prev, h.episodes));
  }
  return [...m.entries()].map(([platform, episodes]) => ({ platform, episodes }));
}

/** Collapse duplicate season rows sharing a season number (the prototype seed
    shipped some shows with each season listed twice). Union the per-platform
    holdings and keep the richest episode set ("all" beats a partial list). */
export function dedupeSeasons(seasons: Season[]): Season[] {
  const byNum = new Map<number, Season>();
  for (const s of seasons) {
    const prev = byNum.get(s.season);
    if (!prev) {
      byNum.set(s.season, { ...s, owned_on: s.owned_on.map((h) => ({ ...h })) });
      continue;
    }
    byNum.set(s.season, {
      ...prev,
      episode_count: Math.max(prev.episode_count, s.episode_count),
      owned: prev.owned || s.owned,
      owned_on: mergeHoldings(prev.owned_on, s.owned_on),
    });
  }
  return [...byNum.values()].sort((a, b) => a.season - b.season);
}

export function tvOwnedSeasons(t: TVSeries) {
  return t.seasons.filter((s) => s.owned);
}

export function tvPlatforms(t: TVSeries): string[] {
  const set = new Set<string>();
  t.seasons.forEach((s) => s.owned_on.forEach((h) => h.platform && set.add(h.platform)));
  return [...set];
}

/** Episodes owned via a single holding: full count for "all", else list length. */
export function holdingEpisodeCount(h: SeasonHolding, episode_count: number): number {
  return h.episodes === "all" ? episode_count : h.episodes.length;
}

/** Total owned episodes per provider across a series — each season's holding
    contributes its episode count to that platform. */
export function tvProviderEpisodeCounts(t: TVSeries): Record<string, number> {
  const counts: Record<string, number> = {};
  t.seasons.forEach((s) =>
    s.owned_on.forEach((h) => {
      if (!h.platform) return;
      counts[h.platform] = (counts[h.platform] || 0) + holdingEpisodeCount(h, s.episode_count);
    })
  );
  return counts;
}

export function tvCompleteness(t: TVSeries): "partial" | "complete" {
  const owned = tvOwnedSeasons(t);
  // Partial if not every season is owned, or any holding is a specific episode list.
  const partial = owned.some((s) => s.owned_on.some((h) => Array.isArray(h.episodes)));
  return owned.length < t.seasons.length || partial ? "partial" : "complete";
}
