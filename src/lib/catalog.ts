/* Trove — catalog list view-models + filter/sort/search (ported from catalog.jsx).
   Pure functions shared by the server catalog pages. State comes from the URL. */
import type { Catalog, Movie, TVSeries, Game } from "./types";
import { tvOwnedSeasons, tvPlatforms, tvCompleteness, tvProviderEpisodeCounts } from "./tv";

export interface CatalogParams {
  q?: string;
  plat?: string;
  fmt?: string;
  flag?: string;
  sort?: string;
  dir?: string;
}

export const CATALOG_META: Record<
  Catalog,
  { name: string; icon: string; route: string; ratio: string; sorts: { value: string; label: string }[] }
> = {
  movies: {
    name: "Movies",
    icon: "film",
    route: "/movies",
    ratio: "2/3",
    sorts: [
      { value: "title", label: "Title" },
      { value: "year", label: "Year" },
      { value: "added", label: "Recently added" },
    ],
  },
  tv: {
    name: "TV",
    icon: "tv",
    route: "/tv",
    ratio: "2/3",
    sorts: [
      { value: "title", label: "Title" },
      { value: "year", label: "Year" },
      { value: "seasons", label: "# Seasons" },
    ],
  },
  games: {
    name: "Games",
    icon: "game",
    route: "/games",
    ratio: "3/4",
    sorts: [
      { value: "title", label: "Title" },
      { value: "year", label: "Year" },
      { value: "service", label: "Service" },
    ],
  },
};

export interface MovieRowVM {
  raw: Movie;
  id: number;
  title: string;
  year: number | null;
  chips: string[];
  badge: "needs_review" | null;
}
export interface TVRowVM {
  raw: TVSeries;
  id: number;
  title: string;
  year: number | null;
  seasons: number;
  owned: number;
  chips: string[];
  chipCounts: Record<string, number>; // provider -> owned episodes
  completeness: "partial" | "complete";
}
export interface GameRowVM {
  raw: Game;
  id: number;
  title: string;
  year: number | null;
  badge: "needs_tagging" | null;
}

// Sort key that ignores a leading article (A / An / The), the way most catalogs
// alphabetize — "The Matrix" sorts under M. Display titles are unaffected.
export function titleSortKey(title: string): string {
  return (title || "").trim().toLowerCase().replace(/^(the|an|a)\s+/, "");
}

function applySort<T extends { title: string; year: number | null; id: number }>(
  rows: T[],
  sort: string,
  dir: number,
  extra?: (a: T, b: T) => number | null
): T[] {
  return [...rows].sort((a, b) => {
    if (extra) {
      const e = extra(a, b);
      if (e !== null) return e;
    }
    let av: string | number, bv: string | number;
    if (sort === "year") {
      av = a.year || 0;
      bv = b.year || 0;
    } else if (sort === "added") {
      av = a.id;
      bv = b.id;
    } else {
      av = titleSortKey(a.title);
      bv = titleSortKey(b.title);
    }
    return av < bv ? -dir : av > bv ? dir : 0;
  });
}

export function buildMovieRows(movies: Movie[], p: CatalogParams): MovieRowVM[] {
  let rows: MovieRowVM[] = movies.map((m) => ({
    raw: m,
    id: m.id,
    title: m.title,
    year: m.year,
    chips: [...m.digital, ...m.physical],
    badge: m.needs_review ? "needs_review" : null,
  }));
  if (p.q?.trim()) {
    const s = p.q.toLowerCase();
    rows = rows.filter((x) => x.title.toLowerCase().includes(s));
  }
  if (p.plat) rows = rows.filter((x) => x.chips.includes(p.plat!));
  if (p.fmt) rows = rows.filter((x) => (p.fmt === "digital" ? x.raw.digital.length : x.raw.physical.length));
  if (p.flag === "1") rows = rows.filter((x) => x.badge === "needs_review");
  return applySort(rows, p.sort || "title", p.dir === "desc" ? -1 : 1);
}

export function buildTVRows(tv: TVSeries[], p: CatalogParams): TVRowVM[] {
  let rows: TVRowVM[] = tv.map((t) => ({
    raw: t,
    id: t.id,
    title: t.series,
    year: t.year,
    seasons: t.seasons.length,
    owned: tvOwnedSeasons(t).length,
    chips: tvPlatforms(t),
    chipCounts: tvProviderEpisodeCounts(t),
    completeness: tvCompleteness(t),
  }));
  if (p.q?.trim()) {
    const s = p.q.toLowerCase();
    rows = rows.filter((x) => x.title.toLowerCase().includes(s));
  }
  if (p.plat) rows = rows.filter((x) => x.chips.includes(p.plat!));
  if (p.fmt) rows = rows.filter((x) => x.completeness === p.fmt);
  if (p.flag === "1") rows = rows.filter((x) => x.completeness === "partial");
  const dir = p.dir === "desc" ? -1 : 1;
  const sort = p.sort || "title";
  return [...rows].sort((a, b) => {
    if (sort === "seasons") return a.seasons < b.seasons ? -dir : a.seasons > b.seasons ? dir : 0;
    if (sort === "year") return (a.year || 0) < (b.year || 0) ? -dir : (a.year || 0) > (b.year || 0) ? dir : 0;
    const av = titleSortKey(a.title),
      bv = titleSortKey(b.title);
    return av < bv ? -dir : av > bv ? dir : 0;
  });
}

export function buildGameRows(games: Game[], p: CatalogParams): GameRowVM[] {
  let rows: GameRowVM[] = games.map((g) => ({
    raw: g,
    id: g.id,
    title: g.title,
    year: g.year,
    badge: g.needs_tagging ? "needs_tagging" : null,
  }));
  if (p.q?.trim()) {
    const s = p.q.toLowerCase();
    rows = rows.filter((x) => x.title.toLowerCase().includes(s));
  }
  if (p.plat) rows = rows.filter((x) => x.raw.platforms.some((e) => e.service === p.plat));
  if (p.fmt) rows = rows.filter((x) => x.raw.platforms.some((e) => e.format === p.fmt));
  if (p.flag === "1") rows = rows.filter((x) => x.badge === "needs_tagging");
  const dir = p.dir === "desc" ? -1 : 1;
  const sort = p.sort || "title";
  rows = [...rows].sort((a, b) => {
    if (sort === "service") {
      const av = a.raw.platforms[0]?.service || "~";
      const bv = b.raw.platforms[0]?.service || "~";
      return av < bv ? -dir : av > bv ? dir : 0;
    }
    if (sort === "year") return (a.year || 0) < (b.year || 0) ? -dir : (a.year || 0) > (b.year || 0) ? dir : 0;
    const av = titleSortKey(a.title),
      bv = titleSortKey(b.title);
    return av < bv ? -dir : av > bv ? dir : 0;
  });
  // Untagged games float to top regardless of sort when not explicitly filtering.
  if (p.flag !== "1") rows = [...rows].sort((a, b) => (a.badge ? -1 : 0) - (b.badge ? -1 : 0));
  return rows;
}
