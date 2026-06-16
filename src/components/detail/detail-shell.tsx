"use client";
/* Trove — detail hero shell (poster + kicker/title/meta + body + actions).
   Ported from detail.jsx DetailShell. */
import type { ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  score,
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
  score?: number | null;
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
  const router = useRouter();
  // Preserve the list's filters/sort/search on "back". Reconstructing the URL
  // from the query (carried in by the row link) is unreliable, so when we got
  // here via in-app navigation we do a real history back() — that returns to the
  // exact previous list URL with every filter intact. The href is the fallback
  // for deep links / open-in-new-tab.
  const qs = useSearchParams().toString();
  const backTo = qs ? `${backHref}?${qs}` : backHref;
  const onBack = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // keep new-tab/window
    try {
      if (sessionStorage.getItem("trove:inapp")) {
        e.preventDefault();
        router.back();
      }
    } catch {}
  };
  return (
    <div className="detail">
      <Link className="cat-back detail-back" href={backTo} onClick={onBack}>
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
            {score != null && (
              <span className="score-chip" title="TMDB user score (out of 10)">
                <Icon name="star" size={13} />
                {score.toFixed(1)}
              </span>
            )}
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
