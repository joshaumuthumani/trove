"use client";
/* Trove — paste-an-ID metadata editor. Title override + {TMDB|RAWG} id/URL with
   a real Re-fetch that pulls fresh title/year/art. Ported from detail.jsx
   MetaSource (the prototype's Re-fetch was simulated; here it hits the API). */
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { extractTrailingId } from "@/lib/ids";
import { fetchTmdb, fetchRawg } from "@/lib/client-api";

export interface SyncedMeta {
  title: string;
  year: number | null;
  poster_url: string | null;
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

  const onPaste = (v: string) => {
    const num = extractTrailingId(v);
    onId(num || v);
    setSynced(false);
    setError(null);
  };

  const refetch = async () => {
    if (!idValue) return;
    setLoading(true);
    setError(null);
    try {
      if (source.type === "game") {
        const m = await fetchRawg(idValue);
        onSynced?.({ title: m.title, year: m.year, poster_url: m.cover_url });
      } else {
        const m = await fetchTmdb(idValue, source.type);
        onSynced?.({ title: m.title, year: m.year, poster_url: m.poster_url, seasons: m.seasons });
      }
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
        <label className="metasrc-field">
          <span className="metasrc-k">{source.label} ID or URL</span>
          <div className="metasrc-idrow">
            <input className="mono" value={idValue} onChange={(e) => onPaste(e.target.value)} placeholder={source.ph} />
            <Button size="sm" variant="default" icon="download" onClick={refetch} disabled={!idValue || loading}>
              {loading ? "Fetching…" : "Re-fetch"}
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
        <div className="metasrc-hint">Paste a new {source.label} link or ID to re-pull metadata &amp; cover art.</div>
      )}
    </div>
  );
}
