"use client";
/* Trove — metadata editor. Movies/TV: paste a TMDB id/URL and Re-fetch. Games:
   search IGDB by name and pick (IGDB has proper box-art; RAWG only had key-art).
   Ported from detail.jsx MetaSource; the prototype's Re-fetch was simulated. */
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { extractMediaId } from "@/lib/ids";
import { fetchTmdb, searchIgdb, type IgdbCandidate } from "@/lib/client-api";
import { GamePicker } from "./game-picker";

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
  source: { label: "TMDB" | "IGDB"; ph: string; type: "movie" | "tv" | "game" };
  idValue: string;
  onId: (v: string) => void;
  title: string;
  onTitle: (v: string) => void;
  onSynced?: (meta: SyncedMeta) => void;
}) {
  const [synced, setSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<IgdbCandidate[] | null>(null);

  const isGame = source.type === "game";

  const onPaste = (v: string) => {
    onId(extractMediaId(v) || v); // movies/tv only — games search by name
    setSynced(false);
    setError(null);
  };

  const apply = (c: IgdbCandidate) => {
    onId(String(c.id));
    onSynced?.({ title: c.title, year: c.year, poster_url: c.cover_url });
    setSynced(true);
    setCandidates(null);
  };

  const refetch = async () => {
    setError(null);
    if (source.type === "game") {
      const q = title.trim();
      if (!q) {
        setError("Enter a game name first, then Search IGDB.");
        return;
      }
      setLoading(true);
      try {
        const results = await searchIgdb(q);
        if (results.length === 0) setError(`No IGDB match for “${q}”.`);
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
      setSynced(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
        {isGame ? (
          <div className="metasrc-field">
            <span className="metasrc-k">Cover &amp; details</span>
            <div className="metasrc-idrow">
              <Button size="sm" variant="default" icon="search" onClick={refetch} disabled={!title.trim() || loading}>
                {loading ? "Searching…" : "Search IGDB"}
              </Button>
            </div>
          </div>
        ) : (
          <label className="metasrc-field">
            <span className="metasrc-k">{source.label} ID or URL</span>
            <div className="metasrc-idrow">
              <input className="mono" value={idValue} onChange={(e) => onPaste(e.target.value)} placeholder={source.ph} />
              <Button size="sm" variant="default" icon="download" onClick={refetch} disabled={!idValue || loading}>
                {loading ? "Fetching…" : "Re-fetch"}
              </Button>
            </div>
          </label>
        )}
      </div>
      {error ? (
        <div className="metasrc-hint" style={{ color: "var(--danger-2)" }}>
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
            ? "Search IGDB by the title to pull box-art, year & details."
            : "Paste a new " + source.label + " link or ID to re-pull metadata & cover art."}
        </div>
      )}
      {candidates && (
        <GamePicker query={title.trim()} results={candidates} onPick={apply} onCancel={() => setCandidates(null)} />
      )}
    </div>
  );
}
