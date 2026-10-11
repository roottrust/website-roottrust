import type { Metadata } from "next";
import { tools } from "@/features/tools/content";
import { ShadowAiTool } from "@/features/tools/ShadowAiTool";
import { ToolPage } from "@/features/tools/ToolPage";
import { resolveFormMode } from "@/lib/forms";

const tool = tools["shadow-ai"];

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: tool.metaTitle, description: tool.metaDescription };

export default function Page() {
  return <ToolPage tool={tool} mode={resolveFormMode(process.env.FORM_MODE)}><ShadowAiTool /></ToolPage>;
}
