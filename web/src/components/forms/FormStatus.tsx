import type { ContactMode, DemoOutcome, SubmissionResult } from "@/lib/forms";
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

// Real (pilot) contact feedback. "accepted" means the request was stored and queued for the team; the next-business-day
// promise is stated only here because pilot mode requires the operational follow-up to be confirmed.
export function pilotMessage(status: "submitting" | SubmissionResult, reference?: string): string {
  switch (status) {
    case "submitting": return "Enviando solicitação…";
    case "accepted": return `Solicitação recebida${reference ? ` (protocolo ${reference})` : ""}. Retornaremos por ligação ou WhatsApp no próximo dia útil.`;
    case "invalid": return "Confira os campos: algum dado não foi aceito. Seus dados foram mantidos, tente novamente.";
    case "rate_limited": return "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente; seus dados foram mantidos.";
    case "challenge": return "Não foi possível validar a verificação de segurança. Conclua-a novamente e envie de novo.";
    case "forbidden": return "Esta página não está autorizada a enviar a solicitação. Recarregue a página ou use os canais de contato; seus dados foram mantidos.";
    case "unavailable": return "O recebimento está indisponível no momento. Seus dados foram mantidos; tente mais tarde ou use os canais de contato.";
    default: return "Não foi possível enviar a solicitação. Seus dados foram mantidos; tente novamente ou use os canais de contato.";
  }
}

// Real (pilot) report feedback. "accepted" means the request is stored and the e-mail is queued, not that it was sent or delivered.
function pilotReportMessage(status: "submitting" | SubmissionResult): string {
  switch (status) {
    case "submitting": return "Solicitando relatório…";
    case "accepted": return "Pedido registrado. O relatório será enviado por e-mail em seguida; se não chegar, confira a caixa de spam ou use os canais de contato. A entrega não é garantida.";
    case "invalid": return "Confira o e-mail: ele não foi aceito. Tente novamente.";
    case "rate_limited": return "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente; seus dados foram mantidos.";
    case "challenge": return "Não foi possível validar a verificação de segurança. Conclua-a novamente e envie de novo.";
    case "forbidden": return "Esta página não está autorizada a enviar o pedido. Recarregue a página ou use os canais de contato.";
    case "unavailable": return "O envio do relatório está indisponível no momento. Tente mais tarde ou use os canais de contato.";
    default: return "Não foi possível registrar o pedido. Tente novamente ou use os canais de contato.";
  }
}

export function FormStatus({ mode, status, kind, reference }: {
  mode: ContactMode; status: "idle" | "submitting" | SubmissionResult; kind: "contact" | "newsletter" | "report"; reference?: string;
}) {
  const message = mode === "pilot" && (kind === "contact" || kind === "report") ? (status === "idle" ? "" : kind === "contact" ? pilotMessage(status, reference) : pilotReportMessage(status)) : status === "submitting"
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
      <noscript><p>{mode === "pilot" && kind !== "newsletter" ? "Ative JavaScript para enviar a solicitação, ou use os canais de contato." : "Ative JavaScript para validar este formulário local, ou use os canais de contato."}</p></noscript>
      <p role="status" aria-live="polite" className={styles.status}>{message}</p>
    </>
  );
}
