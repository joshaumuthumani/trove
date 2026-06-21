"use client";
/* Trove — on-demand Trakt season augment. TMDB sometimes under-reports seasons;
   this fetches a show's season list from Trakt (TVDB-backed, often more complete)
   and previews only the delta — seasons TMDB is missing, or episode counts that
   differ — letting the user apply per-season. Ownership is never touched, and art
   stays on TMDB (Trakt provides none). */
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { extractTraktRef } from "@/lib/ids";
import { fetchTraktSeasons } from "@/lib/client-api";
import type { Season } from "@/lib/types";

interface Proposal {
  season: number;
  episode_count: number;
  kind: "add" | "update";
  current?: number;
}

export function TraktAugment({ seasons, onApply }: { seasons: Season[]; onApply: (next: Season[]) => void }) {
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const run = async () => {
    if (!extractTraktRef(ref)) {
      setError("Enter a Trakt show link or slug.");
      return;
    }
    setLoading(true);
    setError(null);
    setNote(null);
    try {
      const trakt = await fetchTraktSeasons(ref);
      const props: Proposal[] = [];
      for (const t of trakt) {
        const cur = seasons.find((s) => s.season === t.season);
        if (!cur) props.push({ season: t.season, episode_count: t.episode_count, kind: "add" });
        else if (t.episode_count && t.episode_count !== cur.episode_count)
          props.push({ season: t.season, episode_count: t.episode_count, kind: "update", current: cur.episode_count });
      }
      if (props.length === 0) {
        setNote("Trakt matches what you already have — nothing to add.");
        setProposals(null);
      } else {
        setProposals(props);
        setPicked(new Set(props.map((p) => p.season)));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (season: number) =>
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(season)) n.delete(season);
      else n.add(season);
      return n;
    });

  const apply = () => {
    if (!proposals) return;
    const byNum = new Map<number, Season>(seasons.map((s) => [s.season, { ...s, owned_on: s.owned_on.map((h) => ({ ...h })) }]));
    for (const p of proposals) {
      if (!picked.has(p.season)) continue;
      if (p.kind === "add") {
        byNum.set(p.season, { season: p.season, episode_count: p.episode_count, owned: false, owned_on: [] });
      } else {
        const cur = byNum.get(p.season);
        if (cur) {
          // Keep ownership; only clamp any per-platform "specific" picks to the new count.
          byNum.set(p.season, {
            ...cur,
            episode_count: p.episode_count,
            owned_on: cur.owned_on.map((h) => ({
              ...h,
              episodes: Array.isArray(h.episodes) ? h.episodes.filter((x) => x <= p.episode_count) : h.episodes,
            })),
          });
        }
      }
    }
    onApply([...byNum.values()].sort((a, b) => a.season - b.season));
    setProposals(null);
    setOpen(false);
    setRef("");
    setNote("Applied Trakt seasons — review and Save to keep.");
  };

  return (
    <div className="trakt-aug">
      {!open ? (
        <button
          type="button"
          className="trakt-aug-btn"
          onClick={() => {
            setOpen(true);
            setNote(null);
          }}
        >
          <Icon name="download" size={14} />
          Augment seasons from Trakt
        </button>
      ) : (
        <div className="trakt-aug-row">
          <input
            className="mono"
            value={ref}
            onChange={(e) => {
              setRef(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="trakt.tv/shows/… or slug"
            aria-label="Trakt show link or slug"
          />
          <Button size="sm" variant="default" icon="download" onClick={run} disabled={loading || !ref.trim()}>
            {loading ? "Checking…" : "Check"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setError(null); }}>
            Cancel
          </Button>
        </div>
      )}
      {error ? (
        <div className="trakt-aug-msg trakt-aug-msg--err">{error}</div>
      ) : note ? (
        <div className="trakt-aug-msg">{note}</div>
      ) : null}

      {proposals && (
        <div className="modal-scrim" onClick={() => setProposals(null)}>
          <div
            className="modal modal--list"
            role="dialog"
            aria-modal="true"
            aria-label="Trakt season changes"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Apply Trakt seasons</h3>
            <p>Only the differences Trakt found are shown. Pick what to apply — your ownership is never changed.</p>
            <ul className="trakt-props">
              {proposals.map((p) => (
                <li key={p.season}>
                  <label className="trakt-prop">
                    <input type="checkbox" checked={picked.has(p.season)} onChange={() => toggle(p.season)} />
                    <span className="trakt-prop-main">Season {p.season}</span>
                    <span className="trakt-prop-sub">
                      {p.kind === "add" ? `add · ${p.episode_count} eps` : `${p.current} → ${p.episode_count} eps`}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setProposals(null)}>
                Cancel
              </Button>
              <Button variant="accent" icon="check" onClick={apply} disabled={picked.size === 0}>
                Apply {picked.size}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
