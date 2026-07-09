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
import { FilterBar, type Density } from "@/components/filter-bar";
import { CatalogTable } from "@/components/catalog-table";
import { CatalogGrid } from "@/components/catalog-grid";
import { CATALOG_META } from "@/lib/catalog";
import type { Catalog, GamePlatform } from "@/lib/types";

export interface DisplayRow {
  id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  chips: string[]; // movies/tv: owned-on names
  chipCounts?: Record<string, number>; // tv: owned episodes per provider
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
  view,
}: {
  catalog: Catalog;
  rows: DisplayRow[];
  total: number;
  view: "grid" | "table";
}) {
  const cfg = CATALOG_META[catalog];
  const [density, setDensity] = usePersistedDensity();
  const router = useRouter();
  const pathname = usePathname();
  // Carry the active filters/sort (URL state) into each detail link so the
  // detail's "back" link can return to the same filtered/sorted list.
  const qs = useSearchParams().toString();
  const detailHref = (id: number) => `${cfg.route}/${id}${qs ? `?${qs}` : ""}`;
  // Flag in-app navigation so the detail "back" button can use history.back()
  // and restore this exact filtered/sorted list rather than a reset one. Set it
  // whenever a list is shown (covers Movies/TV/Games and arriving at a detail via
  // global search), not only on a row click.
  useEffect(() => {
    try {
      sessionStorage.setItem("trove:inapp", "1");
    } catch {}
  }, []);
  const markInApp = () => {
    try {
      sessionStorage.setItem("trove:inapp", "1");
    } catch {}
  };

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
      ) : view === "grid" ? (
        <CatalogGrid catalog={catalog} rows={rows} density={density} detailHref={detailHref} markInApp={markInApp} />
      ) : (
        <CatalogTable catalog={catalog} rows={rows} density={density} detailHref={detailHref} markInApp={markInApp} />
      )}

      {/* Floating Add — always reachable without scrolling back to the header. */}
      <Link className="cat-fab" href={`${cfg.route}/new`} aria-label={`Add ${cfg.name}`} title={`Add ${cfg.name}`}>
        <Icon name="plus" size={24} />
      </Link>
    </div>
  );
}
