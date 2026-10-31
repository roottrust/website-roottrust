"use client";

import { NewsletterAction } from "../NewsletterAction";

export function CancelNewsletter() {
  return <NewsletterAction
    kind="cancel"
    title="Cancelar newsletter"
    intro="Cancele os próximos envios da newsletter. Relatórios e eventual autorização comercial são independentes."
    actionLabel="Cancelar próximos envios"
    sendingLabel="Cancelando…"
  />;
}
