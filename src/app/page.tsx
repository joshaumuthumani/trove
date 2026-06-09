/* Trove — Launchpad (/). Three catalog cards with live counts + big global
   search. Ported from launchpad.jsx (cinema concept). */
import { Icon } from "@/components/ui/icon";
import { GlobalSearch } from "@/components/global-search";
import { LaunchpadCard } from "@/components/launchpad-card";
import { getCounts, getLaunchpadArt } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LaunchpadPage() {
  const [counts, art] = await Promise.all([getCounts(), getLaunchpadArt()]);
  const total = counts.movies + counts.tv + counts.games;
  const defs = [
    { name: "Movies", route: "/movies", icon: "film", count: counts.movies, arts: art.movies },
    { name: "TV", route: "/tv", icon: "tv", count: counts.tv, arts: art.tv },
    { name: "Games", route: "/games", icon: "game", count: counts.games, arts: art.games },
  ];
  return (
    <div className="launchpad">
      <div className="lp-hero">
        <div className="lp-hero-top">
          <div className="lp-wordmark">
            <span className="lp-mark">
              <Icon name="home" size={20} />
            </span>
            <div>
              <h1>Trove</h1>
              <p>{total} things you own, across movies, TV &amp; games.</p>
            </div>
          </div>
        </div>
        <GlobalSearch big />
      </div>
      <div className="lp-grid lp-grid--cinema">
        {defs.map((def) => (
          <LaunchpadCard key={def.name} {...def} />
        ))}
      </div>
      <div className="lp-foot">
        <span>
          Owned, not streaming. Trove answers “what do <em>I</em> have, and where.”
        </span>
      </div>
    </div>
  );
}
