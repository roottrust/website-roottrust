import type { Metadata } from "next";
import { ArchivePage } from "@/features/newsletter/ArchivePage";
import { buildArchiveView, parseFiltro, parsePagina } from "@/features/newsletter/archive";
import { getEdicoes, isDemoCatalog } from "@/features/newsletter/current";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata {
  return {
    title: { absolute: "Prévias da newsletter — Root Trust" },
    description: isDemoCatalog()
      ? "Arquivo demonstrativo da newsletter da Root Trust: prévias de amostra com tema, pilar e fontes. Nenhum envio está disponível nesta versão."
      : "Arquivo da newsletter da Root Trust: prévias com tema, pilar e fontes.",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const view = buildArchiveView(await getEdicoes(), parseFiltro(params.pilar), parsePagina(params.pagina));
  return <ArchivePage view={view} />;
}
