/* Trove — launchpad "cinema" catalog card (the shipped default concept).
   Ported from launchpad.jsx CatalogCard. Pure; navigates via <Link>. */
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { posterGradient } from "@/components/ui/poster";
import type { ArtPick } from "@/lib/queries";

const initials = (title: string) =>
  title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export function LaunchpadCard({
  name,
  route,
  icon,
  count,
  arts,
}: {
  name: string;
  route: string;
  icon: string;
  count: number;
  arts: ArtPick[];
}) {
  return (
    <Link href={route} className="lc-cinema">
      <div className="lc-cinema-art" aria-hidden="true">
        {arts.map((a, i) => (
          <div key={i} className="lc-cinema-poster" style={{ ...posterGradient(a.title) }}>
            <span>{initials(a.title)}</span>
          </div>
        ))}
        <div className="lc-cinema-scrim" />
      </div>
      <div className="lc-cinema-body">
        <div className="lc-cinema-icon">
          <Icon name={icon} size={22} />
        </div>
        <div className="lc-cinema-text">
          <span className="lc-cinema-name">{name}</span>
          <span className="lc-cinema-count">{count} owned</span>
        </div>
        <Icon name="chevronRight" size={22} className="lc-cinema-go" />
      </div>
    </Link>
  );
}
