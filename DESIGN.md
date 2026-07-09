---
name: Trove
description: A private vault for owned media — dark surfaces, gold as material, cover art as treasure.
colors:
  bg: "#09090b"
  surface-1: "#121214"
  surface-2: "#17171a"
  surface-3: "#202024"
  surface-hover: "#1b1b1f"
  text: "#f4f4f6"
  text-2: "#a4a4ad"
  text-3: "#8e8e97"
  accent-gold: "#eab308"
  accent-gold-bright: "#f3c14e"
  accent-gold-press: "#ca8a04"
  on-accent: "#1f1603"
  danger-rose: "#f43f5e"
  danger-rose-bright: "#fb7185"
  danger-rose-press: "#e11d48"
  status-ok-green: "#34d399"
  status-review-orange: "#fb923c"
  status-untagged-indigo: "#7c9af5"
typography:
  display:
    fontFamily: "Unbounded, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.07em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "32px"
components:
  button-accent:
    backgroundColor: "{colors.accent-gold}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-accent-hover:
    backgroundColor: "{colors.accent-gold-bright}"
    textColor: "{colors.on-accent}"
  button-accent-active:
    backgroundColor: "{colors.accent-gold-press}"
    textColor: "{colors.on-accent}"
  button-default:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-danger:
    backgroundColor: "{colors.danger-rose-press}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  chip:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "3px 11px 3px 4px"
  input-search:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 13px"
    height: "42px"
  table-row:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text}"
    height: "72px"
---

# Design System: Trove

## 1. Overview

**Creative North Star: "The Lit Vault"**

Trove is a dark room built so that two things glow: the gold, and the art.
Everything else — the surfaces, the chrome, the labels — recedes into near-black
so the collection reads as treasure on a shelf and the accent reads as brass
catching light. The body is `#09090b`, nearly the darkest point in the system;
surfaces step up in barely-there increments (`#121214` → `#17171a` → `#202024`)
so depth is felt as tonal layering, not as shadow. This is a vault interior, lit
from within.

The register is **product**: this is a tool a single owner uses to answer "what
do I own and where can I open it" in under five seconds. So density is a virtue —
tables run tight, mono numerics keep the ledger legible, the same controls repeat
identically across Movies, TV, and Games. But the collector's pleasure is real,
and it lives in the artifact: cover art is never chrome, and where a catalog is
about single owned objects (Movies, Games) the posters lead.

What this system explicitly rejects: the **streaming-service billboard** (giant
autoplaying hero, endless carousels — Trove asserts ownership, not availability);
the **social-film feed** (ratings, reviews, activity — there is no audience here);
and the **enterprise admin panel** (gray chrome, dropdown-stuffed toolbars,
database-client tables). Dense is welcome. Joyless is not.

**Key Characteristics:**
- Near-black vault interior; depth by tonal layering, not shadow.
- Gold is *material*, spent rarely — action and current selection only.
- Cover art is treasure, lit; it never becomes decoration or chrome.
- Mono numerics carry the ledger (counts, years, scores).
- One sans family does all the UI work; a display face is reserved for the wordmark.

## 2. Colors

A near-monochrome dark field of cool zinc neutrals, pierced by a single warm gold
accent and a small, disciplined set of status hues.

### Primary
- **Vault Gold** (`#eab308`): The one voice. Fills the primary action button and
  the add-FAB, marks the current nav item and active filters, and edge-lights
  icons on hover. Its brighter sibling **Gold Edge-Light** (`#f3c14e`) is the
  hover/hi-light state; **Gold Deep** (`#ca8a04`) is the pressed state. On a
  filled gold button, text is near-black **Burnt Ink** (`#1f1603`) — gold is a
  light color, so it takes dark type (measured 9.32:1).

### Secondary
- **Danger Rose** (`#f43f5e`): Destructive actions only — delete buttons, error
  text. Deliberately *not* the accent (the two were unified in an earlier build
  and split apart on purpose). Rose-bright (`#fb7185`) and rose-press (`#e11d48`)
  are its state siblings.

### Tertiary (status)
- **Review Orange** (`#fb923c`): `needs_review` on movies. Always paired with an
  alert icon and the word "Needs review" — never hue alone.
- **Untagged Indigo** (`#7c9af5`): `Untagged` on games; floats to the top of the
  list as a 2-click fix. Rendered as text `#aabef9` on an indigo-soft field.
- **Tagged Green** (`#34d399`): the settled state — a check icon and "Tagged".

### Neutral
- **Vault Interior** (`#09090b`): the body. The darkest surface; everything sits
  on it.
- **Surface 1 / 2 / 3** (`#121214` / `#17171a` / `#202024`): the tonal ladder for
  tables, panels, toolbars, and raised controls. Each step is a few points of
  lightness — layering, not contrast.
- **Ink / Ink-2 / Ink-3** (`#f4f4f6` / `#a4a4ad` / `#8e8e97`): primary text,
  secondary/muted text, and faint labels. Ink-3 is the floor — it clears AA
  (5.51:1 on surface-2) and must not go dimmer.
- **Hairlines**: `rgba(255,255,255,.07)` and `.12` — borders are light-on-dark at
  very low alpha, felt more than seen.

### Named Rules
**The One Voice Rule.** Gold appears on ≤10% of any screen. It is the only warm
color in a cool field, so a single gold element commands the eye — spend it on
the one action that matters and nothing else. A gold button next to a gold badge
next to a gold chip is three voices; pick one.

**The Split-Accent Rule.** Gold is action; rose is destruction. They are never
interchanged and never adjacent as if equivalent. If a delete affordance is gold,
it is wrong.

**The No-Color-Only-Status Rule.** Every status carries an icon and a word. Hue is
redundant reinforcement, never the sole signal — the status palette collapses
under red-green color vision deficiency (orange vs green measures 1.02:1 in
simulation), so color can never be load-bearing.

## 3. Typography

**Display Font:** Unbounded (with system-ui, sans-serif) — wordmark only.
**Body/UI Font:** Hanken Grotesk (with system-ui, sans-serif).
**Mono Font:** JetBrains Mono (with ui-monospace, monospace).

**Character:** One humanist grotesk does nearly all the work — headings, buttons,
labels, body, all in Hanken Grotesk at different weights (400–800). The contrast
axis is not two similar sans-serifs (a banned pairing); it's grotesk-against-mono:
JetBrains Mono carries every number, so counts, years, and scores align in tabular
columns and read as a ledger. Unbounded — a rounded geometric display face — is
quarantined to the "Trove" wordmark so it never muddies UI labels.

### Hierarchy
- **Display** (Unbounded, 700, 32px, 1.1): the launchpad wordmark, and only there.
- **Headline** (Hanken 700–800, 23–24px, ~1.2, -0.02em): catalog page titles,
  launchpad cinema-card names.
- **Title** (Hanken 700, 18px): card names, section headings, detail sub-heads.
- **Body** (Hanken 400–600, 15px, 1.45): row titles, descriptions, general UI.
  Prose caps at 65–75ch; dense data is exempt.
- **Label** (Hanken 700, 11.5px, +0.07em, UPPERCASE): table column headers, badge
  text, the density hint. Tracked and small; the only uppercase in the system.
- **Mono** (JetBrains 400–600, 13px, tabular-nums): every numeric — counts, years,
  scores, the catalog-count pill.

### Named Rules
**The Ledger Rule.** All numerics are mono and `tabular-nums`. A year, a count, or
a score never renders in the sans; digits must align vertically down a column.

**The Wordmark Quarantine.** Unbounded appears only in the "Trove" wordmark. It is
never a UI label, a button, or a heading — a display face in UI chrome is a
product-register ban.

## 4. Elevation

This system is **near-flat and built on tonal layering, not shadow.** Depth comes
from the surface ladder (`bg` → `surface-1` → `surface-2` → `surface-3`): a raised
control is a lighter zinc, not a drop-shadowed one. Shadows exist but are reserved
and physical — they belong to things that genuinely float above the vault floor:
posters, the search popover, the add-FAB, dropdowns.

### Shadow Vocabulary
- **Poster lift** (`box-shadow: 0 6px 20px -8px rgba(0,0,0,.75)`): cover art sits
  above its surface, like a print standing off a shelf.
- **Card ambient** (`box-shadow: 0 1px 0 rgba(255,255,255,.03) inset, 0 8px 24px -12px rgba(0,0,0,.7)`):
  the hover state on launchpad cards — a faint top inner highlight plus a soft
  drop, the card catching light as it rises.
- **Popover** (`box-shadow: 0 24px 50px -16px rgba(0,0,0,.8)`): the global-search
  and dropdown overlays, thrown high above the page.

### Named Rules
**The Tonal-Depth Rule.** Reach for a lighter surface before a shadow. Panels,
toolbars, and rows separate by tone; shadow is only for elements that literally
overlay the page (posters, popovers, the FAB). A drop-shadow on a table row is
wrong.

## 5. Components

### Buttons
- **Shape:** gently rounded (10px), 1px transparent border that some variants
  color in.
- **Accent:** gold fill, burnt-ink text, weight 700, a soft gold glow
  (`0 4px 14px -6px`). Hover → gold-edge-light; active → gold-deep. The primary
  action, one per view.
- **Default:** surface-3 fill, hairline-2 border, ink text. The neutral worker.
- **Ghost:** transparent, ink-2 text; hover fills surface-2. For low-emphasis and
  toolbar actions.
- **Danger / Ghost-danger:** rose-press fill with white text, or transparent with
  ink-2 that reveals a rose-soft field and rose-bright text on hover.
- **Disabled:** 0.5 opacity, `not-allowed` cursor.
- **Focus:** a 3px gold-soft ring (`box-shadow: 0 0 0 3px rgba(234,179,8,.14)`).

### Chips
- **Style:** pill (999px), surface-3 field, hairline border, ink text, 13px/600.
  Left-padded tight (4px) to seat a leading service mark or logo.
- **Variants:** `--muted` (transparent, ink-3) for de-emphasized tags;
  removable chips carry a trailing × that turns gold on hover.

### Cards / Containers
- **Corner Style:** 16px (`--r-lg`) for launchpad cards, 12px (`--r-md`) for the
  table and spotlight rows.
- **Background:** surface-1, hairline border.
- **Shadow Strategy:** flat at rest; on hover, lift 2–3px and gain the card-ambient
  shadow + a brighter border. See Elevation.
- **Internal Padding:** 18px cards; 16–22px row insets.
- **Signature move:** launchpad cards carry per-catalog art motifs — the cinema
  card scrims a poster behind the title; the shelf card fans five colored spines
  that splay on hover; the spotlight row shows mini-posters.

### Inputs / Fields
- **Style:** surface-2 field, hairline border, 11px radius, 38–42px tall.
- **Focus:** border shifts to gold-line and a 3px gold-soft glow blooms
  (`:focus-within`); background lifts to surface-3.
- **Placeholder:** ink-3 (`#8e8e97`) — meets AA (5.51:1), not the washed default.

### Navigation
- **Top bar:** 60px, translucent near-black with a 16px backdrop blur, hairline
  bottom border. Links are ink-2/600, hover to ink on surface-2; the active link
  sits on surface-3 with a **gold** icon. Right-aligned search field.

### Signature Component — Catalog Table
- Dense grid rows (`.trow`), per-catalog column templates, two densities
  (comfortable 72px / compact 48px). Row hover raises the background to
  surface-hover and blooms a 2px gold left-edge (`::before`, opacity 0→1) — the
  one place a gold hairline is allowed, because it's transient and marks focus.
  Keyboard focus draws a full 2px gold-bright outline instead.

## 6. Do's and Don'ts

### Do:
- **Do** keep gold to ≤10% of any screen — action and current selection only. Its
  rarity is what makes it read as brass.
- **Do** render every number in JetBrains Mono with `tabular-nums`.
- **Do** separate surfaces by tone (`surface-1/2/3`) before reaching for a shadow.
- **Do** pair every status color with an icon and a word. Orange + "Needs review",
  green + "Tagged", indigo + "Untagged".
- **Do** keep the same button, filter, and search vocabulary identical across
  Movies, TV, and Games. Only the browse representation (grid vs table) may differ.
- **Do** give inputs the gold-line + gold-soft-glow focus bloom, and every
  interactive element the 3px gold-soft focus ring.

### Don't:
- **Don't** use gold and rose as if interchangeable. Gold is action; rose is
  destruction. A gold delete button is a bug.
- **Don't** signal status by hue alone. Never wire up `.chip-dot` (the 7px
  color-only dot); delete it. It's the one place CVD would break the catalog.
- **Don't** let cover art become chrome or decoration — no art used as a texture
  behind unrelated content. Art is the treasure; it earns its own space.
- **Don't** put Unbounded (the display face) into any UI label, button, or
  heading. It belongs to the wordmark alone.
- **Don't** build the **streaming-service billboard**: no giant autoplaying hero,
  no endless carousels. Trove is ownership, not availability.
- **Don't** build the **social-film feed**: no ratings, reviews, or activity. There
  is no audience.
- **Don't** build the **enterprise admin panel**: no gray chrome, no
  dropdown-stuffed toolbars, no database-client tables. Dense is welcome; joyless
  is banned.
- **Don't** drop a drop-shadow on a table row or a flat panel. Shadow is only for
  things that truly float (posters, popovers, the FAB).
