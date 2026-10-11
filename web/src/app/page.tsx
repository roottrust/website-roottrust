import type { Metadata } from "next";
import { Home } from "@/features/home/Home";
import { resolveFormMode } from "@/lib/forms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Root Trust — Confiabilidade com profundidade" },
  description: "Cibersegurança, infraestrutura em nuvem e desenvolvimento de software para operações críticas. Conheça a Root Trust e solicite uma conversa inicial.",
};

export default function HomePage() {
  return <Home mode={resolveFormMode(process.env.FORM_MODE)} />;
}
