import { notFound } from "next/navigation";
import { MovieDetail } from "@/components/detail/movie-detail";
import { getMovie } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovie(Number(id));
  if (!movie) notFound();
  return <MovieDetail movie={movie} />;
}
