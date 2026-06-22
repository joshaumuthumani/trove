"use client";
/* Trove — game search-results picker. Games are matched by name (IGDB), so when
   the search returns several we ask which one. Escape or a scrim click cancels.
   Reuses the .rawg-pick* styles. */
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { IgdbCandidate } from "@/lib/client-api";

export function GamePicker({
  query,
  results,
  onPick,
  onCancel,
}: {
  query: string;
  results: IgdbCandidate[];
  onPick: (c: IgdbCandidate) => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="modal-scrim" onClick={onCancel}>
      <div
        className="modal modal--list"
        role="dialog"
        aria-modal="true"
        aria-label={`Game matches for ${query}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Which game?</h3>
        <p>IGDB returned several matches for “{query}”. Pick the right one to pull its year &amp; cover art.</p>
        <ul className="rawg-pick">
          {results.map((c) => (
            <li key={c.id}>
              <button type="button" className="rawg-pick-item" onClick={() => onPick(c)}>
                <span className="rawg-pick-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.cover_url ? <img src={c.cover_url} alt="" /> : <Icon name="game" size={18} />}
                </span>
                <span className="rawg-pick-meta">
                  <span className="rawg-pick-title">{c.title}</span>
                  <span className="rawg-pick-year">{c.year ?? "—"}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
