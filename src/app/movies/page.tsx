import { CatalogView, type DisplayRow } from "@/components/catalog-view";
import { getAllMovies } from "@/lib/queries";
import { buildMovieRows, type CatalogParams } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function MoviesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const params: CatalogParams = {
    q: str(sp.q),
    plat: str(sp.plat),
    fmt: str(sp.fmt),
    flag: str(sp.flag),
    sort: str(sp.sort),
    dir: str(sp.dir),
  };
  const movies = await getAllMovies();
  const rows: DisplayRow[] = buildMovieRows(movies, params).map((v) => ({
    id: v.id,
    title: v.title,
    year: v.year,
    poster_url: v.raw.poster_url,
    chips: v.chips,
    badge: v.badge,
  }));
  return <CatalogView catalog="movies" rows={rows} total={movies.length} />;
}
