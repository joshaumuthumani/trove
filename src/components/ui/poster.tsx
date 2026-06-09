/* Trove — poster/cover tile. Renders cached art when a URL exists, else a
   deterministic cinematic gradient placeholder (ported from lib.jsx). Pure. */
import { cx } from "@/lib/cx";
import { Icon } from "./icon";

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function posterGradient(title: string): { backgroundImage: string } {
  const h = hashStr(title);
  const hue = h % 360;
  const hue2 = (hue + 40 + (h % 60)) % 360;
  const c1 = `oklch(0.40 0.09 ${hue})`;
  const c2 = `oklch(0.17 0.05 ${hue2})`;
  const ang = 145 + (h % 60);
  return { backgroundImage: `linear-gradient(${ang}deg, ${c1} 0%, ${c2} 75%)` };
}

export function PosterTile({
  title,
  year,
  src,
  ratio = "2/3",
  size = 48,
  rounded = 10,
  missing = false,
  kind = "film",
  className,
}: {
  title?: string;
  year?: number | null;
  src?: string | null;
  ratio?: string;
  size?: number;
  rounded?: number;
  missing?: boolean;
  kind?: string;
  className?: string;
}) {
  const initials = (title || "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const grad = missing ? null : posterGradient(title || "");
  return (
    <div
      className={cx("poster", className)}
      style={{
        width: size,
        aspectRatio: ratio,
        borderRadius: rounded,
        flex: "0 0 auto",
        ...(missing ? { background: "var(--surface-3)" } : grad),
      }}
    >
      {missing ? (
        <div className="poster-missing">
          <Icon name={kind} size={Math.max(16, size * 0.32)} />
          <span style={{ fontSize: Math.max(7, size * 0.14) }}>no art</span>
        </div>
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="poster-img" src={src} alt={title || ""} draggable={false} />
      ) : (
        <>
          <span className="poster-watermark" style={{ fontSize: size * 0.55 }}>
            {initials}
          </span>
          <div className="poster-meta">
            <span className="poster-title" style={{ fontSize: Math.max(8, size * 0.13) }}>
              {title}
            </span>
            {year ? (
              <span className="poster-year" style={{ fontSize: Math.max(7, size * 0.11) }}>
                {year}
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
