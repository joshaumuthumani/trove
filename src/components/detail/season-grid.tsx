"use client";
/* Trove — TV season grid. Each season can be owned on multiple platforms, and
   episode ownership is tracked PER platform (e.g. all on Apple TV, just the
   pilot on YouTube). Read + edit, with a cascade that stacks a platform onto
   every owned season. */
import { useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { ServiceMark } from "@/components/ui/marks";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { TV_PLATFORMS } from "@/lib/platforms";
import type { Season, SeasonHolding } from "@/lib/types";

const epsLabel = (h: SeasonHolding) => (h.episodes === "all" ? "all" : "ep " + (h.episodes as number[]).join(", "));

function SeasonRow({ s, editable, onChange, onRemove }: { s: Season; editable: boolean; onChange: (s: Season) => void; onRemove?: () => void }) {
  const setOwned = (v: boolean) => onChange({ ...s, owned: v, owned_on: v ? s.owned_on : [] });
  const setCount = (n: number) =>
    onChange({
      ...s,
      episode_count: n,
      owned_on: s.owned_on.map((h) => ({ ...h, episodes: Array.isArray(h.episodes) ? h.episodes.filter((x) => x <= n) : h.episodes })),
    });
  const addHolding = (platform: string) => {
    if (!platform) return;
    onChange({ ...s, owned: true, owned_on: [...s.owned_on, { platform, episodes: "all" }] });
  };
  const setHolding = (i: number, h: SeasonHolding) => onChange({ ...s, owned_on: s.owned_on.map((x, j) => (j === i ? h : x)) });
  const removeHolding = (i: number) => onChange({ ...s, owned_on: s.owned_on.filter((_, j) => j !== i) });
  const toggleEp = (i: number, h: SeasonHolding, n: number) => {
    const cur = Array.isArray(h.episodes) ? h.episodes : [];
    setHolding(i, { ...h, episodes: cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n].sort((a, b) => a - b) });
  };
  const available = TV_PLATFORMS.filter((p) => !s.owned_on.some((h) => h.platform === p));

  if (!editable) {
    return (
      <div className={cx("srow", !s.owned && "srow--off")}>
        <div className="srow-own">
          {s.owned ? (
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
        <div className="srow-mode">{!s.owned && <span className="srow-muted">Not owned</span>}</div>
        <div className="srow-plat">
          {s.owned && s.owned_on.length ? (
            <div className="chiprow">
              {s.owned_on.map((h, i) => (
                <span className="hold-chip" key={h.platform + i} title={`${h.platform} — ${epsLabel(h)}`}>
                  <ServiceMark name={h.platform} size={18} />
                  <span className="hold-chip-eps">{epsLabel(h)}</span>
                </span>
              ))}
            </div>
          ) : s.owned ? (
            <span className="srow-muted">source unspecified</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("srow srow--edit", !s.owned && "srow--off")}>
      <div className="srow-head">
        <button className={cx("ownbox", s.owned && "ownbox--on")} onClick={() => setOwned(!s.owned)} aria-label="Owned" aria-pressed={s.owned}>
          {s.owned && <Icon name="check" size={14} />}
        </button>
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
        {onRemove && (
          <button className="srow-remove" onClick={onRemove} aria-label={`Remove season ${s.season}`} title="Remove season">
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {s.owned && (
        <div className="srow-holdings">
          <span className="srow-holdings-h">Where I own it</span>
          {s.owned_on.map((h, i) => {
            const specific = Array.isArray(h.episodes);
            return (
              <div className="hold" key={h.platform + i}>
                <div className="hold-head">
                  <ServiceMark name={h.platform} size={20} />
                  <span className="hold-name">{h.platform}</span>
                  <Segmented
                    size="sm"
                    equal
                    value={specific ? "specific" : "all"}
                    onChange={(m) => setHolding(i, { ...h, episodes: m === "specific" ? [] : "all" })}
                    options={[
                      { value: "all", label: "All" },
                      { value: "specific", label: "Specific" },
                    ]}
                  />
                  <button className="hold-x" onClick={() => removeHolding(i)} aria-label={`Remove ${h.platform}`} title={`Remove ${h.platform}`}>
                    <Icon name="x" size={13} />
                  </button>
                </div>
                {specific && (
                  <div className="epgrid">
                    {Array.from({ length: s.episode_count }, (_, k) => k + 1).map((n) => (
                      <button key={n} className={cx("epbox", (h.episodes as number[]).includes(n) && "epbox--on")} onClick={() => toggleEp(i, h, n)}>
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {available.length > 0 && (
            <Select
              size="sm"
              ariaLabel="Add platform"
              value=""
              onChange={addHolding}
              options={[{ value: "", label: "+ platform" }, ...available.map((p) => ({ value: p, label: p }))]}
            />
          )}
          {s.owned_on.length === 0 && <span className="srow-muted">Owned — add a platform above, or leave as source-unspecified.</span>}
        </div>
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
    onChange?.([...seasons, { season: next, episode_count: 0, owned: true, owned_on: [] }]);
  };
  // Stack a platform (all episodes) onto every owned season that lacks it.
  const applyCascade = (p: string) => {
    if (!p) return;
    onChange?.(
      seasons.map((s) =>
        s.owned && !s.owned_on.some((h) => h.platform === p) ? { ...s, owned_on: [...s.owned_on, { platform: p, episodes: "all" }] } : s
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
