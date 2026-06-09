"use client";
/* Trove — TV detail (read + edit) with the season grid. Ported from detail.jsx
   TVDetail. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DetailShell } from "./detail-shell";
import { DeleteConfirm } from "./delete-confirm";
import { MetaSource, type SyncedMeta } from "./meta-source";
import { SeasonGrid } from "./season-grid";
import { updateItem, deleteItem } from "@/lib/client-api";
import { tvOwnedSeasons } from "@/lib/tv";
import type { TVSeries, Season } from "@/lib/types";

export function TVDetail({ series }: { series: TVSeries }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>(series.seasons.map((s) => ({ ...s, owned_on: [...s.owned_on] })));
  const [title, setTitle] = useState(series.series);
  const [year, setYear] = useState<number | null>(series.year);
  const [poster, setPoster] = useState<string | null>(series.poster_url);
  const [tmdbId, setTmdbId] = useState(String(series.tmdb_id || ""));
  const [del, setDel] = useState(false);

  const owned = tvOwnedSeasons(series).length;

  const reset = () => {
    setSeasons(series.seasons.map((s) => ({ ...s, owned_on: [...s.owned_on] })));
    setTitle(series.series);
    setYear(series.year);
    setPoster(series.poster_url);
    setTmdbId(String(series.tmdb_id || ""));
  };

  const onSynced = (m: SyncedMeta) => {
    setTitle(m.title);
    setYear(m.year);
    setPoster(m.poster_url);
    if (m.seasons && m.seasons.length) {
      // Merge fresh episode counts onto existing ownership; add any new seasons.
      const next: Season[] = m.seasons.map((fs) => {
        const cur = seasons.find((s) => s.season === fs.season);
        return cur
          ? { ...cur, episode_count: fs.episode_count }
          : { season: fs.season, episode_count: fs.episode_count, episodes: "unowned", owned_on: [] };
      });
      setSeasons(next.sort((a, b) => a.season - b.season));
    }
  };

  const save = async () => {
    await updateItem("tv", series.id, {
      tmdb_id: tmdbId,
      series: title.trim() || series.series,
      year,
      poster_url: poster,
      note: series.note,
      seasons,
    });
    setEditing(false);
    router.refresh();
  };

  return (
    <>
      <DetailShell
        kind="tv"
        title={series.series}
        year={series.year}
        posterUrl={series.poster_url}
        ratio="2/3"
        backHref="/tv"
        backLabel="TV"
        sub={`${owned}/${series.seasons.length} seasons`}
        editing={editing}
        onEdit={() => setEditing(true)}
        onDelete={() => setDel(true)}
        onSave={save}
        onCancel={() => {
          reset();
          setEditing(false);
        }}
      >
        {editing && (
          <>
            <MetaSource
              source={{ label: "TMDB", ph: "e.g. 95396 or themoviedb.org/tv/95396", type: "tv" }}
              idValue={tmdbId}
              onId={setTmdbId}
              title={title}
              onTitle={setTitle}
              onSynced={onSynced}
            />
            <div className="metasrc-divider" />
          </>
        )}
        <div className="ownblock">
          <span className="ownblock-h">
            Seasons
            {series.note && !editing && <span className="ownblock-note">{series.note}</span>}
          </span>
          <SeasonGrid seasons={editing ? seasons : series.seasons} editable={editing} onChange={setSeasons} />
        </div>
      </DetailShell>
      {del && (
        <DeleteConfirm
          title={series.series}
          onCancel={() => setDel(false)}
          onConfirm={async () => {
            await deleteItem("tv", series.id);
            router.push("/tv");
          }}
        />
      )}
    </>
  );
}
