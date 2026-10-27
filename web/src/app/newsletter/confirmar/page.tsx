import type { Metadata } from "next";
import { ConfirmNewsletter } from "./ConfirmNewsletter";

export const metadata: Metadata = { title: "Confirmar newsletter — Root Trust", robots: { index: false, follow: false } };

export default function Page() {
  return <ConfirmNewsletter />;
}
