"use client";
/* Trove — game ownership editor (multiple service+format entries). A new row's
   service starts empty; format controls appear once a service is picked; empty
   rows are dropped on save. Ported from detail.jsx GamePlatformsEditor. */
import { Icon } from "@/components/ui/icon";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import { GAME_SERVICES, isDigitalOnlySvc } from "@/lib/platforms";
import type { GamePlatform } from "@/lib/types";

export function GamePlatformsEditor({
  entries,
  onChange,
}: {
  entries: GamePlatform[];
  onChange: (e: GamePlatform[]) => void;
}) {
  const set = (i: number, e: GamePlatform) => onChange(entries.map((x, j) => (j === i ? e : x)));
  const add = () => onChange([...entries, { service: "", format: "" }]);
  const remove = (i: number) => onChange(entries.filter((_, j) => j !== i));

  return (
    <div className="gpe">
      {entries.length === 0 && <p className="gpe-empty">Not owned anywhere yet — add a platform below.</p>}
      {entries.map((e, i) => (
        <div className="gpe-row" key={i}>
          <Select
            size="sm"
            ariaLabel="Service"
            value={e.service}
            onChange={(s) =>
              set(i, { service: s, format: !s ? "" : isDigitalOnlySvc(s) ? "Digital" : e.format || "Disc" })
            }
            options={[{ value: "", label: "— service —" }, ...GAME_SERVICES.map((s) => ({ value: s, label: s }))]}
          />
          {!e.service ? (
            <span className="gpe-steam gpe-steam--empty">pick a service</span>
          ) : isDigitalOnlySvc(e.service) ? (
            <span className="gpe-steam">
              <Icon name="download" size={14} />
              Digital only
            </span>
          ) : (
            <Segmented
              size="sm"
              value={e.format || "Disc"}
              onChange={(f) => set(i, { ...e, format: f })}
              options={[
                { value: "Digital", label: "Digital" },
                { value: "Disc", label: "Disc" },
              ]}
            />
          )}
          <button className="gpe-remove" onClick={() => remove(i)} aria-label="Remove platform">
            <Icon name="x" size={15} />
          </button>
        </div>
      ))}
      <button className="gpe-add" onClick={add}>
        <Icon name="plus" size={15} />
        Add platform
      </button>
    </div>
  );
}
