/* Trove — TV derived helpers (ported from catalog.jsx). */
import type { TVSeries, Season, SeasonEpisodes } from "./types";

function mergeEpisodes(a: SeasonEpisodes, b: SeasonEpisodes): SeasonEpisodes {
  if (a === "all" || b === "all") return "all";
  const al = Array.isArray(a) ? a : [];
  const bl = Array.isArray(b) ? b : [];
  if (al.length || bl.length) return Array.from(new Set([...al, ...bl])).sort((x, y) => x - y);
  return "unowned";
}

/** Collapse duplicate season rows sharing a season number (the prototype seed
    shipped some shows with each season listed twice). Union the platforms and
    keep the richest ownership: "all" beats a partial list beats "unowned". */
export function dedupeSeasons(seasons: Season[]): Season[] {
  const byNum = new Map<number, Season>();
  for (const s of seasons) {
    const prev = byNum.get(s.season);
    if (!prev) {
      byNum.set(s.season, { ...s, owned_on: [...(s.owned_on || [])] });
      continue;
    }
    byNum.set(s.season, {
      ...prev,
      episode_count: Math.max(prev.episode_count, s.episode_count),
      episodes: mergeEpisodes(prev.episodes, s.episodes),
      owned_on: Array.from(new Set([...(prev.owned_on || []), ...(s.owned_on || [])])),
    });
  }
  return [...byNum.values()].sort((a, b) => a.season - b.season);
}

export function tvOwnedSeasons(t: TVSeries) {
  return t.seasons.filter((s) => s.episodes !== "unowned");
}

export function tvPlatforms(t: TVSeries): string[] {
  const set = new Set<string>();
  t.seasons.forEach((s) => (s.owned_on || []).forEach((p) => set.add(p)));
  return [...set];
}

/** Episodes owned in a season: full count for "all", list length for a partial
    selection, 0 for "unowned". */
export function ownedEpisodeCount(s: { episodes: TVSeries["seasons"][number]["episodes"]; episode_count: number }): number {
  if (s.episodes === "all") return s.episode_count;
  if (s.episodes === "unowned") return 0;
  return Array.isArray(s.episodes) ? s.episodes.length : 0;
}

/** Total owned episodes per provider across a series' seasons — a season owned on
    several providers contributes its owned-episode count to each. */
export function tvProviderEpisodeCounts(t: TVSeries): Record<string, number> {
  const counts: Record<string, number> = {};
  t.seasons.forEach((s) => {
    const n = ownedEpisodeCount(s);
    if (n <= 0) return;
    (s.owned_on || []).forEach((p) => {
      counts[p] = (counts[p] || 0) + n;
    });
  });
  return counts;
}

export function tvCompleteness(t: TVSeries): "partial" | "complete" {
  const owned = tvOwnedSeasons(t);
  const partialEps = owned.some((s) => Array.isArray(s.episodes));
  return owned.length < t.seasons.length || partialEps ? "partial" : "complete";
}
