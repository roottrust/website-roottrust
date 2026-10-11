import type { Metadata } from "next";
import { ServicePage } from "@/features/services/ServicePage";
import { getService } from "@/features/services/content";
import { resolveFormMode } from "@/lib/forms";

const service = getService("desenvolvimento-de-software");

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: service.metaTitle, description: service.metaDescription };

export default function Page() {
  return <ServicePage service={service} mode={resolveFormMode(process.env.FORM_MODE)} />;
}
