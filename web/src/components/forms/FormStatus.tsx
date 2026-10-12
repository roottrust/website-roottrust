import type { DemoOutcome, FormMode, SubmissionResult } from "@/lib/forms";
import styles from "./forms.module.css";

export function DemoControls({ id, outcome, onChange, disabled }: {
  id: string; outcome: DemoOutcome; onChange: (value: DemoOutcome) => void; disabled: boolean;
}) {
  return (
    <label className={styles.demoControl} htmlFor={`${id}-demo`}>
      Resultado da demonstração
      <select id={`${id}-demo`} value={outcome} disabled={disabled} onChange={(event) => onChange(event.target.value as DemoOutcome)}>
        <option value="success">Pedido aceito localmente</option>
        <option value="error">Erro e nova tentativa</option>
      </select>
    </label>
  );
}

export function FormStatus({ mode, status, kind }: {
  mode: FormMode; status: "idle" | "submitting" | SubmissionResult; kind: "contact" | "newsletter" | "report";
}) {
  const message = status === "submitting"
    ? kind === "contact" ? "Enviando solicitação…" : "Solicitando confirmação…"
    : status === "accepted"
      ? kind === "contact"
        ? "Demonstração: solicitação aceita localmente. Nenhum dado foi enviado."
        : kind === "newsletter"
          ? "Demonstração: pedido aceito aguardando confirmação. Nenhum dado foi enviado."
          : "Demonstração: pedido de relatório aceito localmente. Nenhum dado foi enviado."
      : status === "error"
        ? "Não foi possível concluir a solicitação demonstrativa. Tente novamente. Nenhum dado foi enviado."
        : status === "unavailable"
          ? "O envio ainda não está disponível. Nenhum dado foi enviado."
          : "";
  return (
    <>
      {mode === "demo" ? <p className={styles.notice}>Demonstração local — nenhum dado é enviado ou guardado.</p> : null}
      <noscript><p>Ative JavaScript para validar este formulário local, ou use os canais de contato.</p></noscript>
      <p role="status" aria-live="polite" className={styles.status}>{message}</p>
    </>
  );
}
