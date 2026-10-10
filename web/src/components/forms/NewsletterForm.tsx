"use client";

import { useId, useState, type FormEvent } from "react";
import { validateEmail, type FormMode } from "@/lib/forms";
import { DemoControls, FormStatus } from "./FormStatus";
import { useLocalSubmission } from "./useLocalSubmission";
import styles from "./forms.module.css";

export function NewsletterForm({ mode, editionSlug, variant }: { mode: FormMode; editionSlug?: string; variant?: "home" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const submission = useLocalSubmission(mode);
  const busy = submission.status === "submitting";
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validateEmail(email);
    setError(nextError);
    if (nextError) { document.getElementById(`${id}-email`)?.focus(); return; }
    void submission.submit({ kind: "newsletter", email: email.trim(), editionSlug });
  }
  return (
    <form className={`${styles.form} ${variant === "home" ? styles.homeNewsletter : ""}`} noValidate onSubmit={handleSubmit} aria-label="Assinar newsletter" aria-busy={busy}>
      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>Seu e-mail</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="Seu e-mail" required value={email} readOnly={busy}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-email-error` : `${id}-help`}
          onChange={(event) => setEmail(event.target.value)} />
        {error ? <p className={styles.error} id={`${id}-email-error`}>{error}</p> : null}
      </div>
      <p className={styles.notice} id={`${id}-help`}>Conteúdo completo por e-mail após confirmação, com próximos envios em dias úteis. O envio ainda não está disponível nesta versão.</p>
      {mode === "demo" ? <DemoControls id={id} outcome={submission.outcome} onChange={submission.setOutcome} disabled={busy} /> : null}
      <button className="button" type="submit" aria-label={busy ? "Solicitando confirmação…" : editionSlug ? "Receber esta edição completa" : "Assinar"} disabled={!submission.ready || busy}>{variant === "home" ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> : busy ? "Solicitando confirmação…" : editionSlug ? "Receber esta edição completa" : "Assinar"}</button>
      <FormStatus mode={mode} status={submission.status} kind="newsletter" />
    </form>
  );
}
