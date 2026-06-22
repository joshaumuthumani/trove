"use client";
/* Trove — Add flow. Movies/TV: paste a TMDB id/URL -> fetch -> preview. Games:
   search IGDB by name -> pick -> preview. Then set ownership, save, redirect to
   the new detail. Ported from add.jsx; the simulated fetch is now live. */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { PosterTile } from "@/components/ui/poster";
import { PlatformPicker } from "./platform-picker";
import { GamePlatformsEditor } from "./game-platforms-editor";
import { GamePicker } from "./game-picker";
import { SeasonGrid } from "./season-grid";
import { CATALOG_META } from "@/lib/catalog";
import { MOVIE_DIGITAL, MOVIE_PHYSICAL, toggleDigital } from "@/lib/platforms";
import { fetchTmdb, searchIgdb, createItem, type IgdbCandidate } from "@/lib/client-api";
import type { Catalog, GamePlatform, Season } from "@/lib/types";

type Stage = "input" | "fetching" | "error" | "preview";

interface Meta {
  id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  director?: string | null;
  user_score?: number | null;
  overview?: string | null;
}

const LABELS: Record<Catalog, string> = { movies: "movie", tv: "series", games: "game" };
const EXAMPLE: Record<Catalog, string> = {
  movies: "tmdb.org/movie/414906",
  tv: "tmdb.org/tv/95396",
  games: "Control",
};

export function AddFlow({ catalog }: { catalog: Catalog }) {
  const cfg = CATALOG_META[catalog];
  const router = useRouter();
  const isGame = catalog === "games";
  const [raw, setRaw] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [digital, setDigital] = useState<string[]>([]);
  const [physical, setPhysical] = useState<string[]>([]);
  const [gameEntries, setGameEntries] = useState<GamePlatform[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [gameResults, setGameResults] = useState<IgdbCandidate[] | null>(null);
  const source = isGame ? "IGDB" : "TMDB";

  const applyGame = (c: IgdbCandidate) => {
    setMeta({ id: String(c.id), title: c.title, year: c.year, poster_url: c.cover_url });
    setGameEntries([]);
    setGameResults(null);
    setStage("preview");
  };

  const doFetch = async () => {
    if (!raw.trim()) return;
    setStage("fetching");
    setErrMsg(null);
    try {
      if (isGame) {
        const results = await searchIgdb(raw.trim());
        if (results.length === 0) {
          setErrMsg(`No IGDB match for “${raw.trim()}”.`);
          setStage("error");
        } else if (results.length === 1) {
          applyGame(results[0]);
        } else {
          setGameResults(results); // let the user pick
          setStage("input");
        }
        return;
      }
      const m = await fetchTmdb(raw, catalog === "tv" ? "tv" : "movie");
      setMeta({
        id: m.id,
        title: m.title,
        year: m.year,
        poster_url: m.poster_url,
        director: m.director,
        user_score: m.user_score,
        overview: m.overview,
      });
      if (catalog === "tv") {
        setSeasons((m.seasons || []).map((s) => ({ season: s.season, episode_count: s.episode_count, owned: true, owned_on: [] })));
      }
      setDigital([]);
      setPhysical([]);
      setStage("preview");
    } catch (e) {
      setErrMsg((e as Error).message);
      setStage("error");
    }
  };

  const tog = (set: (a: string[]) => void, arr: string[], p: string) =>
    set(arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]);

  const save = async () => {
    if (!meta) return;
    let body: Record<string, unknown>;
    if (catalog === "movies") {
      body = { tmdb_id: meta.id, title: meta.title, year: meta.year, poster_url: meta.poster_url, director: meta.director, user_score: meta.user_score, overview: meta.overview, digital, physical };
    } else if (isGame) {
      body = { title: meta.title, year: meta.year, cover_url: meta.poster_url, platforms: gameEntries };
    } else {
      body = { tmdb_id: meta.id, series: meta.title, year: meta.year, poster_url: meta.poster_url, director: meta.director, user_score: meta.user_score, overview: meta.overview, seasons };
    }
    const { id } = await createItem(catalog, body);
    router.push(`${cfg.route}/${id}`);
  };

  return (
    <div className="addflow">
      <Link className="cat-back" href={cfg.route}>
        <Icon name="chevronLeft" size={16} />
        {cfg.name}
      </Link>
      <div className="add-head">
        <div className="cat-title-icon">
          <Icon name={cfg.icon} size={20} />
        </div>
        <h1>Add a {LABELS[catalog]}</h1>
      </div>

      <div className="add-card">
        {/* Step 1 — find it */}
        <div className={cx("add-step", stage !== "input" && stage !== "error" && "add-step--done")}>
          <div className="add-step-num">{stage !== "input" && stage !== "error" ? <Icon name="check" size={14} /> : "1"}</div>
          <div className="add-step-body">
            <label className="add-step-label">{isGame ? "Search for the game" : `Paste the ${cfg.name === "Movies" ? "TMDB movie" : "TMDB"} ID or URL`}</label>
            <div className="add-idrow">
              <div className={cx("add-idfield", stage === "error" && "add-idfield--err")}>
                <input
                  value={raw}
                  autoFocus
                  onChange={(e) => {
                    setRaw(e.target.value);
                    if (stage === "error") setStage("input");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && doFetch()}
                  placeholder={`e.g. ${EXAMPLE[catalog]}`}
                  disabled={stage === "fetching" || stage === "preview"}
                />
                {stage === "preview" && (
                  <button className="add-idedit" onClick={() => setStage("input")}>
                    <Icon name="pencil" size={14} />
                    Change
                  </button>
                )}
              </div>
              {stage !== "preview" && (
                <Button
                  variant="accent"
                  icon={stage === "fetching" ? undefined : isGame ? "search" : "enter"}
                  onClick={doFetch}
                  disabled={stage === "fetching" || !raw.trim()}
                >
                  {stage === "fetching" ? (isGame ? "Searching…" : "Fetching…") : isGame ? "Search" : "Fetch"}
                </Button>
              )}
            </div>
            <p className="add-hint">
              {isGame ? "Trove searches IGDB by name for box-art & details." : `Accepts a pasted URL or a bare ID — Trove pulls the rest from ${source}.`}
            </p>
            {stage === "error" && (
              <div className="add-error">
                <Icon name="alert" size={16} />
                <div>
                  <strong>{isGame ? "Couldn’t find that game." : "Couldn’t fetch that ID."}</strong> {errMsg || `Check the ${source} ${LABELS[catalog]}.`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* fetching shimmer */}
        {stage === "fetching" && (
          <div className="add-preview add-preview--loading">
            <div className="add-prev-poster skel" style={{ aspectRatio: cfg.ratio }} />
            <div className="add-prev-info">
              <div className="skel skel-line" style={{ width: "60%" }} />
              <div className="skel skel-line" style={{ width: "30%" }} />
            </div>
          </div>
        )}

        {/* Step 2 — preview + set ownership */}
        {stage === "preview" && meta && (
          <>
            <div className="add-preview">
              <PosterTile title={meta.title} year={meta.year} src={meta.poster_url} size={112} rounded={12} ratio={cfg.ratio} kind={cfg.icon} />
              <div className="add-prev-info">
                <span className="add-prev-confirm">
                  <Icon name="check" size={13} />
                  Found on {source}
                </span>
                <h2>{meta.title}</h2>
                <span className="add-prev-year">
                  {meta.year}
                  {catalog === "tv" && ` · ${seasons.length} season${seasons.length === 1 ? "" : "s"}`}
                </span>
              </div>
            </div>

            <div className="add-step">
              <div className="add-step-num">2</div>
              <div className="add-step-body">
                <label className="add-step-label">Set ownership</label>
                {catalog === "movies" && (
                  <div className="edit-block">
                    <PlatformPicker title="Digital lockers" options={MOVIE_DIGITAL} selected={digital} onToggle={(p) => setDigital(toggleDigital(digital, p))} />
                    <PlatformPicker title="Physical" options={MOVIE_PHYSICAL} selected={physical} onToggle={(p) => tog(setPhysical, physical, p)} />
                  </div>
                )}
                {isGame && (
                  <div className="edit-block edit-block--wide">
                    <div className="ppick">
                      <span className="ppick-label">Where I own it</span>
                      <GamePlatformsEditor entries={gameEntries} onChange={setGameEntries} />
                    </div>
                  </div>
                )}
                {catalog === "tv" && <SeasonGrid seasons={seasons} editable onChange={setSeasons} />}
              </div>
            </div>

            <div className="add-save">
              <Button variant="ghost" href={cfg.route}>
                Cancel
              </Button>
              <Button variant="accent" icon="check" onClick={save}>
                Save to Trove
              </Button>
            </div>
          </>
        )}
      </div>

      {gameResults && (
        <GamePicker query={raw.trim()} results={gameResults} onPick={applyGame} onCancel={() => setGameResults(null)} />
      )}
    </div>
  );
}
