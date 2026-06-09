/* Trove — ownership marks: ServiceMark (square logo tile), FormatBadge (physical
   format pill), LogoRow, Chip. The service-vs-physical split is routed by
   isPhysical(). Ported from lib.jsx. Pure/presentational. */
import { cx } from "@/lib/cx";
import { SERVICE_LOGO, FORMAT_LOGO, isPhysical } from "@/lib/platforms";
import { Icon } from "./icon";

export function ServiceMark({ name, size = 22 }: { name: string; size?: number }) {
  const logo = SERVICE_LOGO[name];
  if (logo) {
    const inset = Math.round((logo.pad || 0) * size);
    return (
      <span
        className={cx("svc-mark svc-mark--logo", logo.plain && "svc-mark--plain")}
        title={name}
        style={{ width: size, height: size, background: logo.bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt={name}
          draggable={false}
          style={{
            width: size - 2 * inset,
            height: size - 2 * inset,
            objectFit: logo.fit || "contain",
            display: "block",
          }}
        />
      </span>
    );
  }
  // Monogram fallback for any service without a supplied logo.
  const t = (name || "?").slice(0, 2);
  return (
    <span
      className="svc-mark"
      title={name}
      style={{ width: size, height: size, background: "#3a3a40", fontSize: size * 0.5 }}
    >
      {t}
    </span>
  );
}

export function FormatBadge({
  name,
  small,
  onRemove,
  bare,
}: {
  name: string;
  small?: boolean;
  onRemove?: () => void;
  bare?: boolean;
}) {
  const f = FORMAT_LOGO[name];
  const h = (f?.h || 14) * (small ? 0.88 : 1);
  return (
    <span
      className={cx("fmt-badge", small && "fmt-badge--sm", bare && "fmt-badge--bare")}
      title={f?.alt || name}
    >
      {f?.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.src} alt={f.alt || name} draggable={false} style={{ height: h, width: "auto", display: "block" }} />
      ) : (
        <span className="fmt-badge-txt">{name}</span>
      )}
      {onRemove && (
        <button className="chip-x" onClick={onRemove} aria-label={"Remove " + name}>
          <Icon name="x" size={11} />
        </button>
      )}
    </span>
  );
}

export function LogoRow({ names, max, size = 22 }: { names: string[]; max?: number; size?: number }) {
  if (!names || names.length === 0) return <span className="chips-none">—</span>;
  const shown = max ? names.slice(0, max) : names;
  const extra = names.length - shown.length;
  return (
    <div className="logorow">
      {shown.map((n, i) =>
        isPhysical(n) ? (
          <FormatBadge key={n + i} name={n} small />
        ) : (
          <ServiceMark key={n + i} name={n} size={size} />
        )
      )}
      {extra > 0 && <span className="chip-more">+{extra}</span>}
    </div>
  );
}

export function Chip({
  label,
  muted,
  onRemove,
  small,
  showLabel = true,
}: {
  label: string;
  muted?: boolean;
  onRemove?: () => void;
  small?: boolean;
  showLabel?: boolean;
}) {
  if (isPhysical(label)) return <FormatBadge name={label} small={small} onRemove={onRemove} />;
  return (
    <span className={cx("chip", muted && "chip--muted", small && "chip--sm")}>
      <ServiceMark name={label} size={small ? 18 : 22} />
      {showLabel && <span className="chip-label">{label}</span>}
      {onRemove && (
        <button className="chip-x" onClick={onRemove} aria-label={"Remove " + label}>
          <Icon name="x" size={11} />
        </button>
      )}
    </span>
  );
}
