"use client";
/* Trove — catalog table shell. Receives already-filtered rows from the server
   (URL-driven) and owns presentation-only state: density (localStorage) and
   row rendering. Ported from catalog.jsx CatalogView. */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PosterTile } from "@/components/ui/poster";
import { LogoRow } from "@/components/ui/marks";
import { GamePlatformChips } from "@/components/ui/game-chips";
import { FilterBar, type Density } from "@/components/filter-bar";
import { CATALOG_META } from "@/lib/catalog";
import type { Catalog, GamePlatform } from "@/lib/types";

export interface DisplayRow {
  id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  chips: string[]; // movies/tv: owned-on names
  director?: string | null; // movies/tv only
  user_score?: number | null; // movies/tv only (0–10)
  seasons?: number;
  owned?: number;
  platforms?: GamePlatform[];
  badge?: "needs_review" | "needs_tagging" | null;
}

function usePersistedDensity(): [Density, (d: Density) => void] {
  const [d, setD] = useState<Density>("comfortable");
  useEffect(() => {
    try {
      const v = localStorage.getItem("trove-density");
      if (v === "compact" || v === "comfortable") setD(v);
    } catch {}
  }, []);
  const set = useCallback((nv: Density) => {
    setD(nv);
    try {
      localStorage.setItem("trove-density", nv);
    } catch {}
  }, []);
  return [d, set];
}

export function CatalogView({
  catalog,
  rows,
  total,
}: {
  catalog: Catalog;
  rows: DisplayRow[];
  total: number;
}) {
  const cfg = CATALOG_META[catalog];
  const [density, setDensity] = usePersistedDensity();
  const router = useRouter();
  const pathname = usePathname();
  // Carry the active filters/sort (URL state) into each detail link so the
  // detail's "back" link can return to the same filtered/sorted list.
  const qs = useSearchParams().toString();
  const detailHref = (id: number) => `${cfg.route}/${id}${qs ? `?${qs}` : ""}`;

  const thumb = density === "compact" ? 34 : 46;
  const maxChips = density === "compact" ? 2 : 3;

  return (
    <div className={cx("catalog", `density-${density}`)}>
      <div className="cat-header">
        <Link className="cat-back" href="/">
          <Icon name="chevronLeft" size={16} />
          Trove
        </Link>
        <div className="cat-title">
          <span className="cat-title-icon">
            <Icon name={cfg.icon} size={20} />
          </span>
          <h1>{cfg.name}</h1>
          <span className="cat-count">{rows.length === total ? total : `${rows.length} of ${total}`}</span>
        </div>
        <Button variant="accent" icon="plus" href={`${cfg.route}/new`}>
          Add
        </Button>
      </div>

      <FilterBar catalog={catalog} density={density} setDensity={setDensity} />

      {rows.length === 0 ? (
        <div className="cat-empty">
          <div className="cat-empty-icon">
            <Icon name="search" size={26} />
          </div>
          <p>No {cfg.name.toLowerCase()} match your filters.</p>
          <Button variant="ghost" size="sm" onClick={() => router.replace(pathname, { scroll: false })}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="table" data-cat={catalog}>
          <div className="thead">
            <span className="th th-thumb"></span>
            <span className="th th-title">Title</span>
            {catalog === "tv" && <span className="th th-num">Seasons</span>}
            {catalog !== "games" && <span className="th th-dir">{catalog === "tv" ? "Created by" : "Director"}</span>}
            {catalog === "games" && <span className="th th-own">Owned on</span>}
            <span className="th th-year">Year</span>
            {catalog !== "games" && <span className="th th-score">Score</span>}
            {catalog !== "games" && <span className="th th-own">Owned on</span>}
            {catalog === "games" && <span className="th th-status">Status</span>}
          </div>
          <div className="tbody">
            {rows.map((r) => (
              <Link key={r.id} className="trow" href={detailHref(r.id)}>
                <span className="td td-thumb">
                  <PosterTile title={r.title} year={r.year} src={r.poster_url} size={thumb} rounded={6} ratio={cfg.ratio} kind={cfg.icon} />
                </span>
                <span className="td td-title">
                  <span className="trow-title">{r.title}</span>
                  {r.badge && catalog !== "games" && <Badge kind={r.badge} />}
                </span>
                {catalog === "tv" && (
                  <span className="td td-num">
                    {r.owned}
                    <span className="td-num-sub">/{r.seasons}</span>
                  </span>
                )}
                {catalog !== "games" && <span className="td td-dir">{r.director || "—"}</span>}
                {catalog === "games" && (
                  <span className="td td-own">
                    <GamePlatformChips entries={r.platforms || []} max={maxChips} size={22} />
                  </span>
                )}
                <span className="td td-year">{r.year || "—"}</span>
                {catalog !== "games" && (
                  <span className="td td-score">
                    {r.user_score != null ? (
                      <>
                        <Icon name="star" size={12} />
                        {r.user_score.toFixed(1)}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                )}
                {catalog !== "games" && (
                  <span className="td td-own">
                    <LogoRow names={r.chips} max={maxChips} size={22} />
                  </span>
                )}
                {catalog === "games" && (
                  <span className="td td-status">
                    {r.badge ? (
                      <Badge kind="needs_tagging" />
                    ) : (
                      <span className="status-ok">
                        <Icon name="check" size={14} />
                        Tagged
                      </span>
                    )}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
