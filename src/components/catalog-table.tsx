"use client";
/* Trove — catalog table body. Extracted from CatalogView; presentation only. */
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { PosterTile } from "@/components/ui/poster";
import { LogoRow } from "@/components/ui/marks";
import { GamePlatformChips } from "@/components/ui/game-chips";
import { CATALOG_META } from "@/lib/catalog";
import type { Catalog } from "@/lib/types";
import type { DisplayRow } from "./catalog-view";
import type { Density } from "./filter-bar";

export function CatalogTable({
  catalog,
  rows,
  density,
  detailHref,
  markInApp,
}: {
  catalog: Catalog;
  rows: DisplayRow[];
  density: Density;
  detailHref: (id: number) => string;
  markInApp: () => void;
}) {
  const cfg = CATALOG_META[catalog];
  const thumb = density === "compact" ? 34 : 46;
  const maxChips = density === "compact" ? 2 : 3;
  return (
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
          <Link key={r.id} className="trow" href={detailHref(r.id)} onClick={markInApp}>
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
                <LogoRow names={r.chips} max={maxChips} size={22} counts={catalog === "tv" ? r.chipCounts : undefined} />
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
  );
}
