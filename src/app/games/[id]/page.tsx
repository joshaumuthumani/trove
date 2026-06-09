import { notFound } from "next/navigation";
import { GameDetail } from "@/components/detail/game-detail";
import { getGame } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGame(Number(id));
  if (!game) notFound();
  return <GameDetail game={game} />;
}
