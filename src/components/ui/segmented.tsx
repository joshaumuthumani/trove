"use client";
/* Trove — Segmented control. Icon-only buttons carry aria-pressed + aria-label.
   Ported from lib.jsx. */
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./icon";

export type SegOption =
  | string
  | { value: string; label?: string; icon?: IconName; title?: string };

export function Segmented({
  options,
  value,
  onChange,
  size,
  equal,
}: {
  options: SegOption[];
  value: string;
  onChange: (v: string) => void;
  size?: "sm";
  equal?: boolean;
}) {
  return (
    <div className={cx("segmented", size === "sm" && "segmented--sm", equal && "segmented--equal")}>
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const ic = typeof o === "object" ? o.icon : null;
        const aria =
          (typeof o === "object" && (o.title || o.label)) || label || v;
        return (
          <button
            key={v}
            type="button"
            className={cx("seg", value === v && "seg--on")}
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            aria-label={aria}
            title={(typeof o === "object" && o.title) || label || v}
          >
            {ic && <Icon name={ic} size={15} />}
            {label && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
