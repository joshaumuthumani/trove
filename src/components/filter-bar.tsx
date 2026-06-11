"use client";
/* Trove — catalog filter bar. Self-contained: reads/writes sort/filter/search to
   the URL query (refresh-safe, shareable). Ported from catalog.jsx FilterBar. */
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import { CATALOG_META } from "@/lib/catalog";
import { MOVIE_DIGITAL, MOVIE_PHYSICAL, TV_PLATFORMS, GAME_SERVICES } from "@/lib/platforms";
import type { Catalog } from "@/lib/types";

export type Density = "comfortable" | "compact";

export function FilterBar({
  catalog,
  density,
  setDensity,
}: {
  catalog: Catalog;
  density: Density;
  setDensity: (d: Density) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, val: string) => {
      const q = new URLSearchParams(params.toString());
      if (!val) q.delete(key);
      else q.set(key, val);
      const qs = q.toString();
      // Mark the navigation as a transition so the heavy RSC re-render never
      // blocks urgent UI updates (e.g. keystrokes in the search box).
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [params, pathname, router]
  );

  const q = params.get("q") || "";

  // The search box is driven by local state so typed characters appear
  // instantly and are never clobbered by the async URL round-trip. The URL
  // (and thus the server-side filter) is updated on a short debounce.
  const [search, setSearch] = useState(q);
  const lastPushed = useRef(q);
  // Adopt the URL value when it changes from outside this input (back/forward,
  // the clear button, filters that rewrite the query string).
  useEffect(() => {
    if (q !== lastPushed.current) {
      setSearch(q);
      lastPushed.current = q;
    }
  }, [q]);
  // Debounce the URL write driven by local typing.
  useEffect(() => {
    if (search === lastPushed.current) return;
    const t = setTimeout(() => {
      lastPushed.current = search;
      setParam("q", search);
    }, 150);
    return () => clearTimeout(t);
  }, [search, setParam]);
  const plat = params.get("plat") || "";
  const fmt = params.get("fmt") || "";
  const flag = params.get("flag") || "";
  const sort = params.get("sort") || "title";
  const dir = params.get("dir") || "asc";

  const platOpts =
    catalog === "movies"
      ? [{ value: "", label: "All platforms" }, ...[...MOVIE_DIGITAL, ...MOVIE_PHYSICAL].map((p) => ({ value: p, label: p }))]
      : catalog === "tv"
        ? [{ value: "", label: "All platforms" }, ...TV_PLATFORMS.map((p) => ({ value: p, label: p }))]
        : [{ value: "", label: "All services" }, ...GAME_SERVICES.map((s) => ({ value: s, label: s }))];

  return (
    <div className="filterbar">
      <div className="filterbar-search">
        <Icon name="search" size={17} className="fb-search-icon" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${CATALOG_META[catalog].name.toLowerCase()}…`}
          aria-label="Search within catalog"
        />
        {search && (
          <button className="fb-clear" onClick={() => setSearch("")} aria-label="Clear">
            <Icon name="x" size={15} />
          </button>
        )}
      </div>
      <div className="filterbar-controls">
        <Select size="sm" ariaLabel="Filter by platform" value={plat} onChange={(v) => setParam("plat", v)} options={platOpts} />
        {catalog === "movies" && (
          <Select
            size="sm"
            ariaLabel="Format"
            value={fmt}
            onChange={(v) => setParam("fmt", v)}
            options={[
              { value: "", label: "Any format" },
              { value: "digital", label: "Digital" },
              { value: "physical", label: "Physical" },
            ]}
          />
        )}
        {catalog === "tv" && (
          <Select
            size="sm"
            ariaLabel="Seasons"
            value={fmt}
            onChange={(v) => setParam("fmt", v)}
            options={[
              { value: "", label: "All seasons" },
              { value: "complete", label: "Complete" },
              { value: "partial", label: "Partial" },
            ]}
          />
        )}
        {catalog === "games" && (
          <Select
            size="sm"
            ariaLabel="Format"
            value={fmt}
            onChange={(v) => setParam("fmt", v)}
            options={[
              { value: "", label: "Any format" },
              { value: "Digital", label: "Digital" },
              { value: "Disc", label: "Disc" },
            ]}
          />
        )}
        <button className={cx("flagbtn", flag === "1" && "flagbtn--on")} onClick={() => setParam("flag", flag === "1" ? "" : "1")}>
          <Icon name="alert" size={14} />
          {catalog === "games" ? "Untagged" : catalog === "movies" ? "Needs review" : "Partial only"}
        </button>
        <div className="filterbar-spacer" />
        <div className="sortgroup">
          <Select size="sm" ariaLabel="Sort by" value={sort} onChange={(v) => setParam("sort", v)} options={CATALOG_META[catalog].sorts} />
          <button
            className="dirbtn"
            onClick={() => setParam("dir", dir === "desc" ? "asc" : "desc")}
            aria-label={`Sort direction: ${dir === "desc" ? "descending" : "ascending"} (toggle)`}
            title="Toggle direction"
          >
            <Icon name={dir === "desc" ? "arrowDown" : "arrowUp"} size={15} />
          </button>
        </div>
        <Segmented
          size="sm"
          value={density}
          onChange={(v) => setDensity(v as Density)}
          options={[
            { value: "comfortable", icon: "density1", label: "", title: "Comfortable rows" },
            { value: "compact", icon: "density2", label: "", title: "Compact rows" },
          ]}
        />
        <span className="density-hint">density</span>
      </div>
    </div>
  );
}
