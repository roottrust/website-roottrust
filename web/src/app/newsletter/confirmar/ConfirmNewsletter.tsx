"use client";

import { NewsletterAction } from "../NewsletterAction";

export function ConfirmNewsletter() {
  return <NewsletterAction
    kind="confirm"
    title="Confirmar newsletter"
    intro="Confirme seu endereço para receber as próximas edições publicadas em dias úteis. A confirmação não garante a chegada do e-mail à caixa de entrada."
    actionLabel="Confirmar endereço"
    sendingLabel="Confirmando…"
  />;
}
