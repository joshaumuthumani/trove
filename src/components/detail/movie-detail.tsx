"use client";
/* Trove — Movie detail (read + edit). "Where I own it" split into Digital /
   Physical. Ported from detail.jsx MovieDetail. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/marks";
import { DetailShell } from "./detail-shell";
import { DeleteConfirm } from "./delete-confirm";
import { MetaSource, type SyncedMeta } from "./meta-source";
import { PlatformPicker } from "./platform-picker";
import { MOVIE_DIGITAL, MOVIE_PHYSICAL, toggleDigital } from "@/lib/platforms";
import { updateItem, deleteItem } from "@/lib/client-api";
import type { Movie } from "@/lib/types";

export function MovieDetail({ movie }: { movie: Movie }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [digital, setDigital] = useState<string[]>(movie.digital);
  const [physical, setPhysical] = useState<string[]>(movie.physical);
  const [title, setTitle] = useState(movie.title);
  const [year, setYear] = useState<number | null>(movie.year);
  const [poster, setPoster] = useState<string | null>(movie.poster_url);
  const [tmdbId, setTmdbId] = useState(String(movie.tmdb_id || ""));
  const [del, setDel] = useState(false);

  const tog = (set: (a: string[]) => void, arr: string[], p: string) =>
    set(arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]);

  const reset = () => {
    setDigital(movie.digital);
    setPhysical(movie.physical);
    setTitle(movie.title);
    setYear(movie.year);
    setPoster(movie.poster_url);
    setTmdbId(String(movie.tmdb_id || ""));
  };

  const onSynced = (m: SyncedMeta) => {
    setTitle(m.title);
    setYear(m.year);
    setPoster(m.poster_url);
  };

  const save = async () => {
    await updateItem("movies", movie.id, {
      tmdb_id: tmdbId,
      title: title.trim() || movie.title,
      year,
      poster_url: poster,
      digital,
      physical,
      needs_review: false,
    });
    setEditing(false);
    router.refresh();
  };

  const noneOwned = movie.digital.length === 0 && movie.physical.length === 0;

  return (
    <>
      <DetailShell
        kind="film"
        title={title}
        year={year}
        posterUrl={poster}
        ratio="2/3"
        backHref="/movies"
        backLabel="Movies"
        badge={movie.needs_review ? "needs_review" : null}
        editing={editing}
        onEdit={() => setEditing(true)}
        onDelete={() => setDel(true)}
        onSave={save}
        onCancel={() => {
          reset();
          setEditing(false);
        }}
      >
        {editing ? (
          <div className="edit-block">
            <MetaSource
              source={{ label: "TMDB", ph: "e.g. 414906 or themoviedb.org/movie/414906", type: "movie" }}
              idValue={tmdbId}
              onId={setTmdbId}
              title={title}
              onTitle={setTitle}
              onSynced={onSynced}
            />
            <div className="metasrc-divider" />
            <PlatformPicker title="Digital lockers" options={MOVIE_DIGITAL} selected={digital} onToggle={(p) => setDigital(toggleDigital(digital, p))} />
            <PlatformPicker title="Physical" options={MOVIE_PHYSICAL} selected={physical} onToggle={(p) => tog(setPhysical, physical, p)} />
          </div>
        ) : (
          <div className="ownblock">
            <span className="ownblock-h">Where I own it</span>
            {noneOwned ? (
              <p className="ownblock-empty">
                Owned — source unspecified.{" "}
                <button className="linkbtn" onClick={() => setEditing(true)}>
                  Add where
                </button>
              </p>
            ) : (
              <div className="ownblock-groups">
                {movie.digital.length > 0 && (
                  <div className="owngroup">
                    <span className="owngroup-label">
                      <Icon name="download" size={13} />
                      Digital
                    </span>
                    <div className="chiprow">
                      {movie.digital.map((p) => (
                        <Chip key={p} label={p} />
                      ))}
                    </div>
                  </div>
                )}
                {movie.physical.length > 0 && (
                  <div className="owngroup">
                    <span className="owngroup-label">
                      <Icon name="disc" size={13} />
                      Physical
                    </span>
                    <div className="chiprow">
                      {movie.physical.map((p) => (
                        <Chip key={p} label={p} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DetailShell>
      {del && (
        <DeleteConfirm
          title={movie.title}
          onCancel={() => setDel(false)}
          onConfirm={async () => {
            await deleteItem("movies", movie.id);
            router.push("/movies");
          }}
        />
      )}
    </>
  );
}
