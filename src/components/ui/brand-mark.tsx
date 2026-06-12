/* Trove — brand mark. The final logo (claude.ai/design handoff, "Direction L1"):
   an aged-gold treasure-chest tile. Gold gradient rounded square + white chest
   glyph. Reproduces the design's chest(size): corner radius 0.26·size, glyph
   0.56·size, with the exact gradient, shadow, and SVG paths from the spec.
   Pure/presentational — pairs with the "Trove" wordmark in Unbounded. */

export function BrandMark({ size = 28, className }: { size?: number; className?: string }) {
  const radius = Math.round(size * 0.26);
  const glyph = Math.round(size * 0.56);
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
        background: "linear-gradient(150deg,#eab308,#a16207)",
        boxShadow: "0 8px 22px -8px rgba(202,138,4,.5),inset 0 1px 0 rgba(255,255,255,.28)",
      }}
    >
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect x="3.4" y="7.2" width="17.2" height="12" rx="2.6" />
        <path d="M3.4 11.4 H20.6" />
        <rect x="9.7" y="9.3" width="4.6" height="4.1" rx="1.2" fill="#fff" />
      </svg>
    </span>
  );
}
