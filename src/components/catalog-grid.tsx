"use client";
/* Trove — poster-grid browse view for Movies & Games. Renders the same
   DisplayRow[] the table does; art leads, ownership marks always visible. */
import Link from "next/link";
import { PosterTile } from "@/components/ui/poster";
import { Badge } from "@/components/ui/badge";
import { LogoRow } from "@/components/ui/marks";
import { GamePlatformChips } from "@/components/ui/game-chips";
import { CATALOG_META } from "@/lib/catalog";
import type { Catalog } from "@/lib/types";
import type { DisplayRow } from "./catalog-view";
import type { Density } from "./filter-bar";

export function CatalogGrid({
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
  const maxMarks = density === "compact" ? 4 : 3;
  return (
    <div className="catgrid" data-cat={catalog}>
      {rows.map((r) => (
        <Link key={r.id} className="catgrid-tile" href={detailHref(r.id)} onClick={markInApp}>
          <div className="catgrid-art">
            <PosterTile title={r.title} year={r.year} src={r.poster_url} size="fill" rounded={10} ratio={cfg.ratio} kind={cfg.icon} />
            {r.badge && (
              <span className="catgrid-badge">
                <Badge kind={r.badge} />
              </span>
            )}
          </div>
          <span className="catgrid-title">{r.title}</span>
          <span className="catgrid-marks">
            {catalog === "games" ? (
              <GamePlatformChips entries={r.platforms || []} max={maxMarks} size={20} />
            ) : (
              <LogoRow names={r.chips} max={maxMarks} size={20} />
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
