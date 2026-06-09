"use client";
/* Trove — Game detail (read + edit). Read view groups ownership by service.
   Edit (auto-shown for untagged games) uses the multi-entry platforms editor.
   Ported from detail.jsx GameDetail. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ServiceMark } from "@/components/ui/marks";
import { groupGamePlatforms } from "@/components/ui/game-chips";
import { Button } from "@/components/ui/button";
import { DetailShell } from "./detail-shell";
import { DeleteConfirm } from "./delete-confirm";
import { MetaSource, type SyncedMeta } from "./meta-source";
import { GamePlatformsEditor } from "./game-platforms-editor";
import { updateItem, deleteItem } from "@/lib/client-api";
import type { Game, GamePlatform } from "@/lib/types";

export function GameDetail({ game }: { game: Game }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [entries, setEntries] = useState<GamePlatform[]>(game.platforms.map((e) => ({ ...e })));
  const [title, setTitle] = useState(game.title);
  const [year, setYear] = useState<number | null>(game.year);
  const [cover, setCover] = useState<string | null>(game.cover_url);
  const [rawgId, setRawgId] = useState(String(game.rawg_id || ""));
  const [del, setDel] = useState(false);

  const reset = () => {
    setEntries(game.platforms.map((e) => ({ ...e })));
    setTitle(game.title);
    setYear(game.year);
    setCover(game.cover_url);
    setRawgId(String(game.rawg_id || ""));
  };

  const onSynced = (m: SyncedMeta) => {
    setTitle(m.title);
    setYear(m.year);
    setCover(m.poster_url);
  };

  const save = async () => {
    await updateItem("games", game.id, {
      rawg_id: rawgId,
      title: title.trim() || game.title,
      year,
      cover_url: cover,
      platforms: entries.filter((e) => e.service),
    });
    setEditing(false);
    router.refresh();
  };

  const showEdit = editing || game.needs_tagging;
  const hasService = entries.filter((e) => e.service).length > 0;

  return (
    <>
      <DetailShell
        kind="game"
        title={game.title}
        year={game.year}
        posterUrl={game.cover_url}
        ratio="3/4"
        backHref="/games"
        backLabel="Games"
        badge={game.needs_tagging && !editing ? "needs_tagging" : null}
        editing={editing}
        onEdit={() => setEditing(true)}
        onDelete={() => setDel(true)}
        onSave={save}
        onCancel={() => {
          reset();
          setEditing(false);
        }}
      >
        {showEdit ? (
          <div className="edit-block edit-block--wide">
            {game.needs_tagging && !editing && (
              <div className="tag-callout">
                <Icon name="alert" size={15} />
                This game is untagged. Add where you own it.
              </div>
            )}
            <MetaSource
              source={{ label: "RAWG", ph: "e.g. 28568 or rawg.io/games/elden-ring", type: "game" }}
              idValue={rawgId}
              onId={setRawgId}
              title={title}
              onTitle={setTitle}
              onSynced={onSynced}
            />
            <div className="metasrc-divider" />
            <div className="ppick">
              <span className="ppick-label">Where I own it</span>
              <GamePlatformsEditor entries={entries} onChange={setEntries} />
            </div>
            {game.needs_tagging && !editing && (
              <Button variant="accent" icon="check" onClick={save} disabled={!hasService}>
                Save
              </Button>
            )}
          </div>
        ) : (
          <div className="ownblock">
            <span className="ownblock-h">Where I own it</span>
            <div className="game-own">
              {groupGamePlatforms(game.platforms).map((r, i) => (
                <div className="game-own-row" key={i}>
                  <span className="game-own-svc">
                    <ServiceMark name={r.service} size={24} />
                    {r.service}
                  </span>
                  <span className="game-own-fmts">
                    {r.formats.map((f) => (
                      <span className="game-own-fmt" key={f}>
                        <Icon name={f === "Disc" ? "disc" : "download"} size={15} />
                        {f}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DetailShell>
      {del && (
        <DeleteConfirm
          title={game.title}
          onCancel={() => setDel(false)}
          onConfirm={async () => {
            await deleteItem("games", game.id);
            router.push("/games");
          }}
        />
      )}
    </>
  );
}
