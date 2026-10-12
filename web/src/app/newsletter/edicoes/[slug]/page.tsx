import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEdicao } from "@/features/newsletter/current";
import { PreviewPage } from "@/features/newsletter/PreviewPage";
import { resolveFormMode } from "@/lib/forms";

export const dynamic = "force-dynamic";

function previewDescription(abertura: readonly { t: string }[]): string {
  const text = abertura.map((s) => s.t).join("");
  if (text.length <= 160) return text;
  const cut = text.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const edicao = await getEdicao((await params).slug);
  if (!edicao) notFound();
  return {
    title: { absolute: `${edicao.titulo} — Prévia · Root Trust` },
    description: previewDescription(edicao.abertura),
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const edicao = await getEdicao((await params).slug);
  if (!edicao) notFound();
  return <PreviewPage edicao={edicao} mode={resolveFormMode(process.env.FORM_MODE)} />;
}
