import { notFound } from "next/navigation";
import Quiz from "@/components/Quiz";
import { getPaket } from "@/lib/paket";

export const dynamic = "force-dynamic";

export default async function PaketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paket = getPaket(slug);
  if (!paket) notFound();
  return <Quiz paket={paket} />;
}
