import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEdicaoBySlug } from "@/features/newsletter/catalog";
import { PreviewPage } from "@/features/newsletter/PreviewPage";
import { resolveFormMode } from "@/lib/forms";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const edicao = getEdicaoBySlug((await params).slug);
  if (!edicao) notFound();
  return {
    title: `${edicao.titulo} — Prévia · Root Trust`,
    description: "Prévia demonstrativa da newsletter da Root Trust. Receba a edição completa por e-mail após confirmar seu endereço.",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const edicao = getEdicaoBySlug((await params).slug);
  if (!edicao) notFound();
  return <PreviewPage edicao={edicao} mode={resolveFormMode(process.env.FORM_MODE)} />;
}
