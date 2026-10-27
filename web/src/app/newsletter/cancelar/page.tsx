import type { Metadata } from "next";
import { CancelNewsletter } from "./CancelNewsletter";

export const metadata: Metadata = { title: "Cancelar newsletter — Root Trust", robots: { index: false, follow: false } };

export default function Page() {
  return <CancelNewsletter />;
}
