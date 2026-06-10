"use client";
/* Trove — detail hero shell (poster + kicker/title/meta + body + actions).
   Ported from detail.jsx DetailShell. */
import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PosterTile } from "@/components/ui/poster";

export function DetailShell({
  kind,
  title,
  year,
  posterUrl,
  ratio,
  sub,
  badge,
  children,
  backHref,
  backLabel,
  editing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: {
  kind: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  ratio: string;
  sub?: string;
  badge?: "needs_review" | "needs_tagging" | null;
  children: ReactNode;
  backHref: string;
  backLabel: string;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const kicker = kind === "film" ? "Movie" : kind === "tv" ? "TV Series" : "Game";
  // Preserve the list's filters/sort (carried in via the row link's query) so
  // "back" returns to the same filtered/sorted catalog, not a reset list.
  const qs = useSearchParams().toString();
  const backTo = qs ? `${backHref}?${qs}` : backHref;
  return (
    <div className="detail">
      <Link className="cat-back detail-back" href={backTo}>
        <Icon name="chevronLeft" size={16} />
        {backLabel}
      </Link>
      <div className="detail-hero">
        <div className="detail-poster">
          <PosterTile title={title} year={year} src={posterUrl} size={232} rounded={16} ratio={ratio} kind={kind} />
        </div>
        <div className="detail-info">
          <div className="detail-kicker">
            <Icon name={kind} size={14} />
            {kicker}
          </div>
          <h1 className="detail-title">{title}</h1>
          <div className="detail-meta">
            {year && <span>{year}</span>}
            {sub && (
              <>
                <span className="dot-sep">·</span>
                <span>{sub}</span>
              </>
            )}
            {badge && <Badge kind={badge} />}
          </div>
          <div className="detail-body">{children}</div>
          <div className="detail-actions">
            {editing ? (
              <>
                <Button variant="accent" icon="check" onClick={onSave}>
                  Save changes
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" icon="pencil" onClick={onEdit}>
                  Edit
                </Button>
                <Button variant="ghostDanger" icon="trash" onClick={onDelete}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
