# Product

## Register

product

## Users

A single user: the owner, on his own hardware, behind Cloudflare Access. There is
no second persona — no guest, no sharing, no public view.

He arrives in one of two contexts, both of them impatient:

- **On the couch, about to watch.** "I want this tonight — which of my services
  already has it?" The answer is a service logo and a click-out.
- **In a store or a sale, about to buy.** "Do I already own this? On what?"
  The answer is yes/no in under five seconds, before the checkout page loads.

He is also, occasionally, in a third context: **browsing his own collection for
pleasure**, with nothing to look up. That context is real and this product
serves it, but it never gets to slow the first two down.

## Product Purpose

Trove is the single source of truth for **owned** media — Movies, TV, and Games —
replacing three aging spreadsheets.

It answers one question: *what do I own, and where can I open it?*

**Ownership, not availability.** It never claims to know what is streaming right
now. A title is in Trove because it was bought, not because it is watchable.
This is the line that separates Trove from WatchAtlas, and it is a scope
boundary, not a style one.

Success looks like: any title and its where-to-open info found in under five
seconds; an entry added or corrected in the browser without a spreadsheet or a
redeploy; every view a real, refresh-safe URL.

## Brand Personality

**Archival, considered, collector's.**

A private vault, kept well. The pleasure is in the keeping, not the showing —
there is no audience. Voice is first-person-singular and unfussy: this is *my*
library, and the interface speaks to one person who already knows what these
things are. No marketing tone, no encouragement, no celebration of routine acts.

Gold is the material of the vault, not a button color that happens to be yellow.
Where it appears it should read as brass and edge-light — the thing the chest is
made of — and it should appear rarely enough that it still means something.

Emotional goal: **quiet pride, instant answer.** The collection should feel worth
having; the lookup should feel like it cost nothing.

## Anti-references

- **Social film communities** (Letterboxd, Trakt). No reviews, no ratings, no
  activity feed, no watch progress, no "recently watched." Trakt owns progress;
  Trove owns ownership. Anything that invites performance to an audience is
  wrong here, because there is no audience.
- **Enterprise admin panels** (Bootstrap / AntD / Material data grids). Gray
  chrome, dropdown-stuffed toolbars, tables that look like a database client.
  Density is welcome; joylessness is not. Dense and beautiful are not opposed.

Not listed as an anti-reference, deliberately: **streaming-service UI**. Poster-
forward browsing is permitted and, for Movies and Games, chosen (see Principle 1).
The separation from Netflix/Plex is *what the catalog asserts* — ownership, not
availability — not how large the artwork is.

## Design Principles

1. **Representation follows the artifact, not the screen.**
   A movie and a game are single owned objects; their box art *is* their
   identity, so they browse as a poster grid. A series is a container — ownership
   is held per season, sometimes per episode — so it browses as a table and
   resolves into the season grid. Where two catalogs diverge, the divergence must
   be traceable to the shape of the thing being catalogued. Never to novelty.

2. **Shared tasks keep a shared vocabulary.**
   The guardrail on Principle 1. Sort, filter, search, add, edit, and delete look
   and behave *identically* across all three catalogs. Only the browse
   representation is allowed to differ. If the "save" button or the filter bar
   diverges between Movies and TV, one of them is a bug. Per-catalog browsing is
   a deliberate, bounded exception to consistency — not a license for it.

3. **Ownership is the answer; everything else is chrome.**
   Every view resolves toward *where can I open it*. Metadata, art, year, runtime
   — all of it is context for that answer, and none of it may outrank it. If a
   screen makes the ownership marks harder to find, the screen is wrong.

4. **Color is a signal, never decoration — and never the only signal.**
   Gold marks action and current selection. Status hue alone is not
   trustworthy: `needs_review` (orange) and `tagged` (green) collapse to the same
   value under red-green color vision deficiency (measured: 1.02:1 after
   deuteranopia simulation). The app is correct on this today — every rendered
   status pairs its color with an icon *and* a text label. The principle exists to
   keep it that way: any new status must carry shape, icon, label, or position,
   never hue by itself.

5. **The URL is the state.**
   Every view — filtered, sorted, searched, deep-linked — is a real address that
   survives a refresh and a paste into a message. Prior builds kept "where am I"
   in memory and bounced users home. State that lives only in a component is a
   defect waiting for a page reload.

## Accessibility & Inclusion

**Target: WCAG 2.1 AA** across all user-facing interface elements (as committed
in CLAUDE.md). Text contrast is in good shape today — every text/background pair
measured clears AA, the lowest being 5.00:1 (the uppercase type-tag on
`surface-3`). Don't regress it.

Called out as load-bearing — a latent risk, not a live defect:

- **Color-blind-safe status.** The status *palette* collapses under red-green CVD.
  Measured pairwise contrast after deuteranopia simulation:

  | pair | after sim | verdict |
  |---|---|---|
  | `--warn` orange vs `--ok` green | 1.02:1 | identical |
  | `--accent` gold vs `--ok` green | 1.11:1 | converges |
  | `--accent` gold vs `--warn` orange | 1.13:1 | converges |
  | `--info` indigo vs `--danger` rose | 1.14:1 | converges |

  `needs_review` (orange) and `tagged` (green) are the primary status axis and the
  *worst* pair. Today this is mitigated: both always render with an icon and a
  word, so hue is redundant, not load-bearing. The one place it would have failed
  — `.chip-dot`, a 7px color-only dot — is defined in CSS but referenced by no
  component (dead code). Keep it that way: never introduce a color-only status,
  and delete `.chip-dot` rather than wiring it up.

Baseline, already partly in place and not to be regressed:

- Keyboard parity throughout (global search is keyboard-driven; focus-visible ring
  system exists; delete confirm is focus-trapped).
- Reduced motion. Today this is a blanket `transition-duration: .01ms !important`
  override across 38 transitions — it satisfies the letter of the requirement
  with a kill-switch. A designed alternative (crossfade, instant state change) is
  the standard to move toward.
- Text alternatives for ownership marks. Service tiles and format pills are
  logo-only; "where can I open it" must be answerable without sight.
