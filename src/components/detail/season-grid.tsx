"use client";
/* Trove — TV season grid. A season can be owned on MULTIPLE platforms. Read +
   edit rows, All/Specific episode grid, per-season platform toggles, and a
   cascade that stacks (unions) a platform onto every owned season. Ported from
   detail.jsx SeasonGrid / SeasonRow / PlatformToggles. */
import { useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { Chip, ServiceMark } from "@/components/ui/marks";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { TV_PLATFORMS } from "@/lib/platforms";
import type { Season } from "@/lib/types";

function PlatformToggles({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (arr: string[]) => void;
}) {
  const toggle = (p: string) =>
    onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p]);
  return (
    <div className="plat-toggles">
      {TV_PLATFORMS.map((p) => {
        const on = selected.includes(p);
        return (
          <button key={p} type="button" className={cx("plat-toggle", on && "plat-toggle--on")} onClick={() => toggle(p)} title={p}>
            <ServiceMark name={p} size={18} />
            <span>{p}</span>
            {on && <Icon name="check" size={12} />}
          </button>
        );
      })}
    </div>
  );
}

function SeasonRow({ s, editable, onChange, onRemove }: { s: Season; editable: boolean; onChange: (s: Season) => void; onRemove?: () => void }) {
  const owned = s.episodes !== "unowned";
  const specific = Array.isArray(s.episodes);
  const plats = s.owned_on || [];
  const setOwned = (v: boolean) =>
    onChange({ ...s, episodes: v ? "all" : "unowned", owned_on: v ? s.owned_on : [] });
  const setMode = (mode: string) =>
    onChange({ ...s, episodes: mode === "specific" ? Array.from({ length: s.episode_count }, (_, i) => i + 1) : "all" });
  const toggleEp = (n: number) => {
    const a = Array.isArray(s.episodes) ? s.episodes : [];
    onChange({ ...s, episodes: a.includes(n) ? a.filter((x) => x !== n) : [...a, n].sort((x, y) => x - y) });
  };
  const setPlats = (arr: string[]) => onChange({ ...s, owned_on: arr });
  // TMDB is sometimes missing seasons; the count is editable so manually-added
  // (or under-reported) seasons can be set. Clamp any "specific" picks to it.
  const setCount = (n: number) =>
    onChange({ ...s, episode_count: n, episodes: Array.isArray(s.episodes) ? s.episodes.filter((x) => x <= n) : s.episodes });

  if (!editable) {
    return (
      <div className={cx("srow", !owned && "srow--off")}>
        <div className="srow-own">
          {owned ? (
            <span className="srow-tick">
              <Icon name="check" size={13} />
            </span>
          ) : (
            <span className="srow-dot" />
          )}
        </div>
        <div className="srow-name">
          Season {s.season}
          <span className="srow-eps">{s.episode_count} eps</span>
        </div>
        <div className="srow-mode">
          {!owned ? (
            <span className="srow-muted">Not owned</span>
          ) : specific ? (
            <span className="srow-specific">Eps {(s.episodes as number[]).join(", ")}</span>
          ) : (
            <span className="srow-all">All episodes</span>
          )}
        </div>
        <div className="srow-plat">
          {owned && plats.length ? (
            <div className="chiprow">
              {plats.map((p) => (
                <Chip key={p} label={p} small />
              ))}
            </div>
          ) : owned ? (
            <span className="srow-muted">source unspecified</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("srow srow--edit", !owned && "srow--off")}>
      <div className="srow-own">
        <button className={cx("ownbox", owned && "ownbox--on")} onClick={() => setOwned(!owned)} aria-label="Owned" aria-pressed={owned}>
          {owned && <Icon name="check" size={14} />}
        </button>
      </div>
      <div className="srow-name">
        Season {s.season}
        <span className="srow-epedit">
          <input
            type="number"
            min={0}
            className="srow-epinput"
            value={s.episode_count}
            onChange={(e) => setCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
            aria-label={`Season ${s.season} episode count`}
          />
          eps
        </span>
      </div>
      <div className="srow-mode">
        {owned ? (
          <div className="srow-modecol">
            <Segmented
              size="sm"
              equal
              value={specific ? "specific" : "all"}
              onChange={setMode}
              options={[
                { value: "all", label: "All" },
                { value: "specific", label: "Specific" },
              ]}
            />
            {specific && (
              <div className="epgrid">
                {Array.from({ length: s.episode_count }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={cx("epbox", (s.episodes as number[]).includes(n) && "epbox--on")} onClick={() => toggleEp(n)}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="srow-muted">Not owned</span>
        )}
      </div>
      <div className="srow-plat">{owned && <PlatformToggles selected={plats} onChange={setPlats} />}</div>
      {onRemove && (
        <button className="srow-remove" onClick={onRemove} aria-label={`Remove season ${s.season}`} title="Remove season">
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

export function SeasonGrid({
  seasons,
  editable,
  onChange,
}: {
  seasons: Season[];
  editable: boolean;
  onChange?: (s: Season[]) => void;
}) {
  const [cascade, setCascade] = useState("");
  const setSeason = (idx: number, ns: Season) => onChange?.(seasons.map((s, i) => (i === idx ? ns : s)));
  const removeSeason = (idx: number) => onChange?.(seasons.filter((_, i) => i !== idx));
  // Add a season TMDB didn't report (numbered after the highest existing one).
  const addSeason = () => {
    const next = seasons.reduce((m, s) => Math.max(m, s.season), 0) + 1;
    onChange?.([...seasons, { season: next, episode_count: 0, episodes: "all", owned_on: [] }]);
  };
  const applyCascade = (p: string) => {
    if (!p) return;
    onChange?.(
      seasons.map((s) =>
        s.episodes !== "unowned" && !(s.owned_on || []).includes(p) ? { ...s, owned_on: [...(s.owned_on || []), p] } : s
      )
    );
    setCascade("");
  };
  return (
    <div className="seasongrid">
      {editable && (
        <div className="seasongrid-cascade">
          <span>Add platform to all owned seasons</span>
          <Select
            size="sm"
            ariaLabel="Cascade platform"
            value={cascade}
            onChange={applyCascade}
            options={[{ value: "", label: "— platform —" }, ...TV_PLATFORMS.map((p) => ({ value: p, label: p }))]}
          />
          <span className="seasongrid-cascade-hint">stacks onto every owned season</span>
        </div>
      )}
      <div className="seasongrid-rows">
        {seasons.map((s, i) => (
          <SeasonRow
            key={s.id ?? s.season}
            s={s}
            editable={editable}
            onChange={(ns) => setSeason(i, ns)}
            onRemove={editable ? () => removeSeason(i) : undefined}
          />
        ))}
      </div>
      {editable && (
        <button type="button" className="seasongrid-add" onClick={addSeason}>
          <Icon name="plus" size={15} />
          Add season
        </button>
      )}
    </div>
  );
}
