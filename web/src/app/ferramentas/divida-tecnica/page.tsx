import type { Metadata } from "next";
import { tools } from "@/features/tools/content";
import { TechDebtTool } from "@/features/tools/TechDebtTool";
import { ToolPage } from "@/features/tools/ToolPage";
import { resolveFormMode } from "@/lib/forms";

const tool = tools["divida-tecnica"];

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: tool.metaTitle, description: tool.metaDescription };

export default function Page() {
  return <ToolPage tool={tool} mode={resolveFormMode(process.env.FORM_MODE)}><TechDebtTool /></ToolPage>;
}
