/* Trove — line icon set (Lucide-style), ported from lib.jsx. Pure/presentational. */
import type { CSSProperties } from "react";

export const ICON_PATHS: Record<string, string> = {
  search: "M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M21 21l-4.35-4.35",
  plus: "M12 5v14 M5 12h14",
  x: "M18 6 6 18 M6 6l12 12",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  chevronLeft: "M15 6l-6 6 6 6",
  check: "M20 6 9 17l-5-5",
  trash: "M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  pencil: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
  sliders: "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  arrowUpDown: "M7 4v16 M7 4l-3 3 M7 4l3 3 M17 20V4 M17 20l-3-3 M17 20l3-3",
  arrowUp: "M12 19V5 M5 12l7-7 7 7",
  arrowDown: "M12 5v14 M19 12l-7 7-7-7",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  density1: "M4 6h16 M4 12h16 M4 18h16",
  density2: "M4 5h16 M4 9.5h16 M4 14h16 M4 18.5h16",
  film: "M2.5 3.5h19v17h-19z M7 3.5v17 M17 3.5v17 M2.5 8.5h4.5 M2.5 15.5h4.5 M17 8.5h4.5 M17 15.5h4.5 M7 12h10",
  tv: "M2 7h20v13H2z M17 2l-5 5-5-5",
  game: "M6 11h4 M8 9v4 M15 12h.01 M18 10h.01 M17.5 5h-11A5.5 5.5 0 0 0 1 10.5v.5a6 6 0 0 0 6 6 4 4 0 0 0 3.2-1.6l.4-.5a2 2 0 0 1 1.6-.8h.6a2 2 0 0 1 1.6.8l.4.5A4 4 0 0 0 17 17a6 6 0 0 0 6-6v-.5A5.5 5.5 0 0 0 17.5 5Z",
  enter: "M9 10l-4 4 4 4 M5 14h11a4 4 0 0 0 4-4V5",
  alert: "M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  home: "M3 10.5 12 3l9 7.5 M5 9.5V21h14V9.5",
  star: "M12 3l2.9 6 6.1.9-4.4 4.3 1 6.1-5.6-3-5.6 3 1-6.1L3 9.9 9.1 9z",
  external: "M15 3h6v6 M10 14 21 3 M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5",
  disc: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0",
  download: "M12 3v12 M7 10l5 5 5-5 M5 21h14",
};

export type IconName = keyof typeof ICON_PATHS;

export function Icon({
  name,
  size = 18,
  className,
  style,
  strokeWidth = 1.75,
}: {
  name: IconName | string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  const d = ICON_PATHS[name] || "";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={(i ? "M" : "") + seg} />
      ))}
    </svg>
  );
}
