import type { Metadata } from "next";
import { getLatestEdicao } from "@/features/newsletter/current";
import { LandingPage } from "@/features/newsletter/LandingPage";
import { latestOrUnavailable } from "@/features/newsletter/source";
import { newsletterAvailability } from "@/app/api/newsletter/inscricao/availability";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Newsletter — Root Trust" },
  description: "Análise sobre cibersegurança, nuvem e software em dias úteis. Leia prévias públicas e receba as edições completas por e-mail.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const { recente, indisponivel } = await latestOrUnavailable(getLatestEdicao);
  return <LandingPage config={newsletterAvailability()} recente={recente} indisponivel={indisponivel} />;
}
