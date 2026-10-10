"use client";

import { useId, useState, type FormEvent } from "react";
import { validateContact, type ContactErrors, type ContactValues, type FormMode } from "@/lib/forms";
import { DemoControls, FormStatus } from "./FormStatus";
import { useLocalSubmission } from "./useLocalSubmission";
import styles from "./forms.module.css";

const fields = [
  { name: "name", label: "Nome", autocomplete: "name", type: "text", placeholder: "Como podemos te chamar" },
  { name: "company", label: "Empresa", autocomplete: "organization", type: "text", placeholder: "Nome da empresa" },
  { name: "whatsapp", label: "WhatsApp", autocomplete: "tel", type: "tel", placeholder: "(00) 00000-0000" },
] as const;

export function ContactForm({ mode, variant }: { mode: FormMode; variant?: "home" }) {
  const id = useId();
  const [values, setValues] = useState<ContactValues>({ name: "", company: "", whatsapp: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const submission = useLocalSubmission(mode);
  const busy = submission.status === "submitting";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    const first = fields.find((field) => nextErrors[field.name]);
    if (first) {
      document.getElementById(`${id}-${first.name}`)?.focus();
      return;
    }
    void submission.submit({ kind: "contact", values: { ...values } });
  }

  return (
    <form className={`${styles.form} ${variant === "home" ? styles.homeContact : ""}`} noValidate onSubmit={handleSubmit} aria-label="Solicitar diagnóstico" aria-busy={busy}>
      <div className={styles.fields}>
        {fields.map((field) => (
          <div className={styles.field} key={field.name}>
            <label htmlFor={`${id}-${field.name}`}>{field.label}</label>
            <input id={`${id}-${field.name}`} name={field.name} type={field.type} autoComplete={field.autocomplete}
              placeholder={variant === "home" ? field.placeholder : undefined}
              required value={values[field.name]} readOnly={busy} aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `${id}-${field.name}-error` : undefined}
              onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />
            {errors[field.name] ? <p className={styles.error} id={`${id}-${field.name}-error`}>{errors[field.name]}</p> : null}
          </div>
        ))}
      </div>
      {mode === "demo" ? <DemoControls id={id} outcome={submission.outcome} onChange={submission.setOutcome} disabled={busy} /> : null}
      <button className="button" type="submit" disabled={!submission.ready || busy}>{busy ? "Enviando solicitação…" : "Solicitar diagnóstico"}{variant === "home" ? <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> : null}</button>
      <FormStatus mode={mode} status={submission.status} kind="contact" />
      <p className={styles.channels}>Fale com a Root Trust: <a href="mailto:contato@roottrust.com.br">contato@roottrust.com.br</a> ou <a href="tel:+5511940084692">11 94008-4692</a>.</p>
    </form>
  );
}
