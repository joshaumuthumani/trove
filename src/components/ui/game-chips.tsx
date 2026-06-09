/* Trove — game ownership chips. Collapses multiple entries of the same service
   into one grouped row (e.g. PlayStation on Disc AND Digital -> single row).
   Ported from lib.jsx. Pure/presentational. */
import { isDigitalOnlySvc } from "@/lib/platforms";
import type { GamePlatform } from "@/lib/types";
import { Icon } from "./icon";
import { ServiceMark } from "./marks";

export interface GroupedPlatform {
  service: string;
  formats: string[];
}

export function groupGamePlatforms(entries: GamePlatform[]): GroupedPlatform[] {
  const out: GroupedPlatform[] = [];
  (entries || []).forEach((e) => {
    if (!e || !e.service) return;
    let r = out.find((x) => x.service === e.service);
    if (!r) {
      r = { service: e.service, formats: [] };
      out.push(r);
    }
    const fmt = isDigitalOnlySvc(e.service) ? "Digital" : e.format || "Disc";
    if (!r.formats.includes(fmt)) r.formats.push(fmt);
  });
  return out;
}

export function GamePlatformChips({
  entries,
  max,
  size = 22,
}: {
  entries: GamePlatform[];
  max?: number;
  size?: number;
}) {
  const groups = groupGamePlatforms(entries);
  if (groups.length === 0) return <span className="chips-none">untagged</span>;
  const shown = max ? groups.slice(0, max) : groups;
  const extra = groups.length - shown.length;
  return (
    <div className="logorow">
      {shown.map((g, i) => (
        <span
          className="glogo"
          key={i}
          title={g.service + (!isDigitalOnlySvc(g.service) ? " · " + g.formats.join(", ") : "")}
        >
          <ServiceMark name={g.service} size={size} />
          {!isDigitalOnlySvc(g.service) &&
            g.formats.map((f) => (
              <Icon key={f} name={f === "Disc" ? "disc" : "download"} size={12} className="glogo-fmt" />
            ))}
        </span>
      ))}
      {extra > 0 && <span className="chip-more">+{extra}</span>}
    </div>
  );
}
