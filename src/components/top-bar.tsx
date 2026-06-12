"use client";
/* Trove — persistent top bar (brand, catalog nav, global search). Ported from
   app.jsx's <header>. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { BrandMark } from "@/components/ui/brand-mark";
import { GlobalSearch } from "@/components/global-search";

const NAV: [string, string, string][] = [
  ["movies", "film", "Movies"],
  ["tv", "tv", "TV"],
  ["games", "game", "Games"],
];

export function TopBar() {
  const pathname = usePathname();
  const cat = pathname.split("/").filter(Boolean)[0];
  return (
    <header className="topbar">
      <Link href="/" className="topbar-brand">
        <BrandMark size={28} />
        Trove
      </Link>
      <nav className="topbar-nav">
        {NAV.map(([r, ic, label]) => (
          <Link key={r} href={`/${r}`} className={cx("topbar-link", cat === r && "topbar-link--on")}>
            <Icon name={ic} size={15} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="topbar-search">
        <GlobalSearch />
      </div>
    </header>
  );
}
