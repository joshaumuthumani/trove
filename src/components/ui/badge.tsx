/* Trove — status badge. Status hues are intentionally distinct from the rose
   accent: amber = needs-review, indigo = untagged. Ported from lib.jsx. */
import { Icon } from "./icon";

export function Badge({ kind }: { kind: "needs_review" | "needs_tagging" }) {
  if (kind === "needs_review")
    return (
      <span className="badge badge--review">
        <Icon name="alert" size={11} />
        Needs review
      </span>
    );
  if (kind === "needs_tagging")
    return (
      <span className="badge badge--tag">
        <Icon name="alert" size={11} />
        Untagged
      </span>
    );
  return null;
}
