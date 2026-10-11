"use client";

import { useId, useState, type FormEvent } from "react";
import { validateEmail, type FormMode } from "@/lib/forms";
import { DemoControls, FormStatus } from "./FormStatus";
import { useLocalSubmission } from "./useLocalSubmission";
import styles from "./forms.module.css";

/** Relatório padrão por tema: envia apenas e-mail e ID da ferramenta; independente da newsletter. */
export function ReportForm({ mode, toolId, topic }: { mode: FormMode; toolId: string; topic: string }) {
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
    void submission.submit({ kind: "report", email: email.trim(), toolId });
  }
  return (
    <form className={styles.form} noValidate autoComplete="off" onSubmit={handleSubmit} aria-label={`Receber relatório de ${topic}`} aria-busy={busy}>
      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>Seu e-mail</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="off" required value={email} readOnly={busy}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-email-error` : `${id}-help`}
          onChange={(event) => setEmail(event.target.value)} />
        {error ? <p className={styles.error} id={`${id}-email-error`}>{error}</p> : null}
      </div>
      <p className={styles.notice} id={`${id}-help`}>Este pedido não inscreve você na newsletter. Suas respostas nunca são associadas ao e-mail.</p>
      {mode === "demo" ? <DemoControls id={id} outcome={submission.outcome} onChange={submission.setOutcome} disabled={busy} /> : null}
      <button className="button" type="submit" disabled={!submission.ready || busy}>{busy ? "Solicitando…" : "Receber relatório"}</button>
      <FormStatus mode={mode} status={submission.status} kind="report" />
    </form>
  );
}
