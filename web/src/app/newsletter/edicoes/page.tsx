import type { Metadata } from "next";
import { ArchivePage } from "@/features/newsletter/ArchivePage";
import { buildArchiveView, parseFiltro, parsePagina } from "@/features/newsletter/archive";
import { EDICOES_PUBLICAS } from "@/features/newsletter/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Prévias da newsletter — Root Trust" },
  description: "Arquivo demonstrativo da newsletter da Root Trust: prévias de amostra com tema, pilar e fontes. Nenhum envio está disponível nesta versão.",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const view = buildArchiveView(EDICOES_PUBLICAS, parseFiltro(params.pilar), parsePagina(params.pagina));
  return <ArchivePage view={view} />;
}
