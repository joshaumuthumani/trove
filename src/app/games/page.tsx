import { CatalogView, type DisplayRow } from "@/components/catalog-view";
import { getAllGames } from "@/lib/queries";
import { buildGameRows, type CatalogParams } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function GamesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const params: CatalogParams = {
    q: str(sp.q),
    plat: str(sp.plat),
    fmt: str(sp.fmt),
    flag: str(sp.flag),
    sort: str(sp.sort),
    dir: str(sp.dir),
  };
  const games = await getAllGames();
  const rows: DisplayRow[] = buildGameRows(games, params).map((v) => ({
    id: v.id,
    title: v.title,
    year: v.year,
    poster_url: v.raw.cover_url,
    chips: [],
    platforms: v.raw.platforms,
    badge: v.badge,
  }));
  return <CatalogView catalog="games" rows={rows} total={games.length} />;
}
