"use client";
/* Trove — paste-an-ID metadata editor. Title override + {TMDB|RAWG} id/URL with
   a real Re-fetch that pulls fresh title/year/art. Ported from detail.jsx
   MetaSource (the prototype's Re-fetch was simulated; here it hits the API). */
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { extractMediaId, extractRawgRef } from "@/lib/ids";
import { fetchTmdb, fetchRawg, searchRawg, type RawgCandidate } from "@/lib/client-api";
import { RawgPicker } from "./rawg-picker";

export interface SyncedMeta {
  title: string;
  year: number | null;
  poster_url: string | null;
  director?: string | null;
  user_score?: number | null;
  overview?: string | null;
  seasons?: { season: number; episode_count: number }[];
}

export function MetaSource({
  source,
  idValue,
  onId,
  title,
  onTitle,
  onSynced,
}: {
  source: { label: "TMDB" | "RAWG"; ph: string; type: "movie" | "tv" | "game" };
  idValue: string;
  onId: (v: string) => void;
  title: string;
  onTitle: (v: string) => void;
  onSynced?: (meta: SyncedMeta) => void;
}) {
  const [synced, setSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<RawgCandidate[] | null>(null);

  const isGame = source.type === "game";

  const onPaste = (v: string) => {
    const ref = isGame ? extractRawgRef(v) : extractMediaId(v);
    onId(ref || v);
    setSynced(false);
    setError(null);
  };

  const apply = (c: RawgCandidate) => {
    onId(String(c.id));
    onSynced?.({ title: c.title, year: c.year, poster_url: c.cover_url });
    setSynced(true);
    setCandidates(null);
  };

  const refetch = async () => {
    setError(null);
    // Games: RAWG has no paste-able id, so with no explicit id we search by name
    // and let the user confirm when there are several matches.
    if (isGame && !idValue.trim()) {
      const q = title.trim();
      if (!q) {
        setError("Enter a game name first, then Re-fetch to search RAWG.");
        return;
      }
      setLoading(true);
      try {
        const results = await searchRawg(q);
        if (results.length === 0) setError(`No RAWG match for “${q}”.`);
        else if (results.length === 1) apply(results[0]);
        else setCandidates(results);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!idValue) return;
    setLoading(true);
    try {
      if (source.type === "game") {
        const m = await fetchRawg(idValue);
        onSynced?.({ title: m.title, year: m.year, poster_url: m.cover_url });
      } else {
        const m = await fetchTmdb(idValue, source.type);
        onSynced?.({
          title: m.title,
          year: m.year,
          poster_url: m.poster_url,
          director: m.director,
          user_score: m.user_score,
          overview: m.overview,
          seasons: m.seasons,
        });
      }
      setSynced(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const canFetch = isGame ? !!idValue.trim() || !!title.trim() : !!idValue;

  return (
    <div className="metasrc">
      <span className="ppick-label">Metadata</span>
      <div className="metasrc-grid">
        <label className="metasrc-field">
          <span className="metasrc-k">Title override</span>
          <input
            value={title}
            onChange={(e) => {
              onTitle(e.target.value);
              setSynced(false);
            }}
            placeholder="Title"
          />
        </label>
        <label className="metasrc-field">
          <span className="metasrc-k">{source.label} ID or URL</span>
          <div className="metasrc-idrow">
            <input className="mono" value={idValue} onChange={(e) => onPaste(e.target.value)} placeholder={source.ph} />
            <Button
              size="sm"
              variant="default"
              icon={isGame && !idValue.trim() ? "search" : "download"}
              onClick={refetch}
              disabled={!canFetch || loading}
            >
              {loading ? "Fetching…" : isGame && !idValue.trim() ? "Search" : "Re-fetch"}
            </Button>
          </div>
        </label>
      </div>
      {error ? (
        <div className="metasrc-hint" style={{ color: "var(--accent-2)" }}>
          {error}
        </div>
      ) : synced ? (
        <div className="metasrc-ok">
          <Icon name="check" size={13} />
          Synced from {source.label} — title, year &amp; art refreshed
        </div>
      ) : (
        <div className="metasrc-hint">
          {isGame
            ? "Set the title and Search RAWG by name, or paste a RAWG id/URL to re-pull metadata & cover art."
            : "Paste a new " + source.label + " link or ID to re-pull metadata & cover art."}
        </div>
      )}
      {candidates && (
        <RawgPicker
          query={title.trim()}
          results={candidates}
          onPick={apply}
          onCancel={() => setCandidates(null)}
        />
      )}
    </div>
  );
}
