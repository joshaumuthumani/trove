"use client";
/* Trove — native styled Select. Ported from lib.jsx. */
import { cx } from "@/lib/cx";
import { Icon } from "./icon";

export type SelectOption = string | { value: string; label: string };

export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  size,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  size?: "sm";
}) {
  return (
    <div className={cx("select", size === "sm" && "select--sm")}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel}>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const label = typeof o === "string" ? o : o.label;
          return (
            <option key={v} value={v}>
              {label}
            </option>
          );
        })}
      </select>
      <Icon name="chevronDown" size={14} className="select-caret" />
    </div>
  );
}
