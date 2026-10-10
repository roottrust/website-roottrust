import { Home } from "@/features/home/Home";
import { resolveFormMode } from "@/lib/forms";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <Home mode={resolveFormMode(process.env.FORM_MODE)} />;
}
