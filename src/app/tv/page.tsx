import { CatalogView, type DisplayRow } from "@/components/catalog-view";
import { getAllTV } from "@/lib/queries";
import { buildTVRows, type CatalogParams } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function TVPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const params: CatalogParams = {
    q: str(sp.q),
    plat: str(sp.plat),
    fmt: str(sp.fmt),
    flag: str(sp.flag),
    sort: str(sp.sort),
    dir: str(sp.dir),
  };
  const tv = await getAllTV();
  const rows: DisplayRow[] = buildTVRows(tv, params).map((v) => ({
    id: v.id,
    title: v.title,
    year: v.year,
    poster_url: v.raw.poster_url,
    chips: v.chips,
    seasons: v.seasons,
    owned: v.owned,
  }));
  return <CatalogView catalog="tv" rows={rows} total={tv.length} />;
}
