import { notFound } from "next/navigation";
import { TVDetail } from "@/components/detail/tv-detail";
import { getTV } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getTV(Number(id));
  if (!series) notFound();
  return <TVDetail series={series} />;
}
