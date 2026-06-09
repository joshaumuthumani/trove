"use client";
/* Trove — RAWG search-results picker. RAWG has no paste-able numeric id like TMDB,
   so games are matched by name; when the search returns several games we ask which
   one. Escape or a scrim click cancels. */
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { RawgCandidate } from "@/lib/client-api";

export function RawgPicker({
  query,
  results,
  onPick,
  onCancel,
}: {
  query: string;
  results: RawgCandidate[];
  onPick: (c: RawgCandidate) => void;
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
        aria-label={`RAWG matches for ${query}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Which game?</h3>
        <p>
          RAWG returned several matches for “{query}”. Pick the right one to pull its year &amp; cover art.
        </p>
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
