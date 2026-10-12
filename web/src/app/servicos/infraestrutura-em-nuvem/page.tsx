import type { Metadata } from "next";
import { ServicePage } from "@/features/services/ServicePage";
import { getService } from "@/features/services/content";

const service = getService("infraestrutura-em-nuvem");

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: service.metaTitle, description: service.metaDescription };

export default function Page() {
  return <ServicePage service={service} />;
}
