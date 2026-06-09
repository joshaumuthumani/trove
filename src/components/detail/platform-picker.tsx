"use client";
/* Trove — movie platform picker (digital lockers / physical). Ported from
   detail.jsx PlatformPicker. */
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { ServiceMark, FormatBadge } from "@/components/ui/marks";
import { isPhysical } from "@/lib/platforms";

export function PlatformPicker({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (p: string) => void;
}) {
  return (
    <div className="ppick">
      <span className="ppick-label">{title}</span>
      <div className="ppick-grid">
        {options.map((p) => {
          const on = selected.includes(p);
          return (
            <button key={p} className={cx("ppick-opt", on && "ppick-opt--on")} onClick={() => onToggle(p)}>
              <span className="ppick-check">{on && <Icon name="check" size={13} />}</span>
              {isPhysical(p) ? <FormatBadge name={p} bare /> : <ServiceMark name={p} size={20} />}
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
