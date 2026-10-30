import type { ReactNode } from "react";
import { retryAfterLabel, type ContactMode, type DemoOutcome, type SubmissionResult } from "@/lib/forms";
import styles from "./forms.module.css";

type FormKind = "contact" | "newsletter" | "report";
type FormStatusValue = "idle" | "submitting" | SubmissionResult;
type Tone = "progress" | "success" | "info" | "problem";
type Action = "review" | "challenge" | "contact";
interface Feedback { tone: Tone; title: string; message: string; action?: Action }

export function DemoControls({ id, outcome, onChange, disabled }: {
  id: string; outcome: DemoOutcome; onChange: (value: DemoOutcome) => void; disabled: boolean;
}) {
  return (
    <label className={styles.demoControl} htmlFor={`${id}-demo`}>
      Resultado da demonstração
      <span className={styles.demoSelect}><select id={`${id}-demo`} value={outcome} disabled={disabled} onChange={(event) => onChange(event.target.value as DemoOutcome)}>
        <option value="success">Pedido aceito localmente</option>
        <option value="error">Erro e nova tentativa</option>
      </select><svg aria-hidden="true" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1.5l5 5 5-5" /></svg></span>
    </label>
  );
}

const CHALLENGE_FAILED = "Não foi possível validar a verificação de segurança. Conclua-a novamente e envie de novo.";

// 429: static phrase from the server's retryAfter (seconds, rounded up); no countdown and no automatic retry.
function rateLimited(retryAfter: number | undefined, fallback: string): string {
  return retryAfter === undefined
    ? fallback
    : `Muitas tentativas em pouco tempo. Tente novamente em ${retryAfterLabel(retryAfter)}; seus dados foram mantidos.`;
}

// Real (pilot) contact feedback. "accepted" means the request was stored and queued for the team; the next-business-day
// promise is stated only here because pilot mode requires the operational follow-up to be confirmed.
// "error" (network failure or 5xx) is an unknown outcome: it never claims rejection and does not invite a blind resend.
export function pilotMessage(status: "submitting" | SubmissionResult, reference?: string, retryAfter?: number): string {
  switch (status) {
    case "submitting": return "Enviando solicitação…";
    case "accepted": return `Solicitação recebida${reference ? ` (protocolo ${reference})` : ""}. Retornaremos por ligação ou WhatsApp no próximo dia útil.`;
    case "invalid": return "Confira os dados do formulário. Seus dados foram mantidos.";
    case "rate_limited": return rateLimited(retryAfter, "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente; seus dados foram mantidos.");
    case "challenge": return CHALLENGE_FAILED;
    case "forbidden": return "Esta página não está autorizada a enviar a solicitação. Recarregue a página ou use os canais de contato; seus dados foram mantidos.";
    case "unavailable": return "O recebimento está indisponível no momento. Seus dados foram mantidos; tente mais tarde ou use os canais de contato.";
    default: return "Não foi possível confirmar se a solicitação foi recebida. Seus dados foram mantidos; antes de enviar de novo, confirme pelos canais de contato.";
  }
}

// Real (pilot) report feedback. "accepted" means the request is stored and the e-mail is queued, not that it was sent or delivered.
function pilotReportMessage(status: "submitting" | SubmissionResult, retryAfter?: number): string {
  switch (status) {
    case "submitting": return "Solicitando relatório…";
    case "accepted": return "Pedido registrado. O relatório deve chegar por e-mail; se não chegar, confira a caixa de spam ou use os canais de contato. A entrega não é garantida.";
    case "invalid": return "Confira o e-mail e tente novamente.";
    case "rate_limited": return rateLimited(retryAfter, "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente; seus dados foram mantidos.");
    case "challenge": return CHALLENGE_FAILED;
    case "forbidden": return "Esta página não está autorizada a enviar o pedido. Recarregue a página ou use os canais de contato; seus dados foram mantidos.";
    case "unavailable": return "O envio do relatório está indisponível no momento. Tente mais tarde ou use os canais de contato.";
    default: return "Não foi possível confirmar se o pedido foi registrado. Antes de pedir de novo, confira seu e-mail e a caixa de spam ou use os canais de contato.";
  }
}

function pilotNewsletterMessage(status: "submitting" | SubmissionResult, retryAfter?: number): string {
  switch (status) {
    case "submitting": return "Solicitando confirmação…";
    case "accepted": return "Pedido registrado. Confira seu e-mail e a caixa de spam para as próximas orientações. O pedido não confirma a inscrição nem a entrega.";
    case "invalid": return "Confira o endereço de e-mail e tente novamente.";
    case "rate_limited": return rateLimited(retryAfter, "Muitas tentativas em pouco tempo. Aguarde e tente novamente.");
    case "challenge": return CHALLENGE_FAILED;
    case "forbidden": return "Esta página não está autorizada a enviar o pedido. Recarregue a página ou use os canais de contato; seus dados foram mantidos.";
    case "unavailable": return "A inscrição está indisponível no momento. Tente mais tarde.";
    default: return "Não foi possível confirmar se o pedido foi registrado. Antes de tentar de novo, confira seu e-mail e a caixa de spam.";
  }
}

const PILOT_PRESENTATION: Record<"submitting" | SubmissionResult, { tone: Tone; title: string; action?: Action }> = {
  submitting: { tone: "progress", title: "Em andamento" },
  accepted: { tone: "success", title: "Registrado" },
  invalid: { tone: "problem", title: "Revise os dados", action: "review" },
  rate_limited: { tone: "problem", title: "Aguarde um pouco" },
  challenge: { tone: "problem", title: "Verificação necessária", action: "challenge" },
  forbidden: { tone: "problem", title: "Envio não autorizado", action: "contact" },
  unavailable: { tone: "problem", title: "Serviço indisponível", action: "contact" },
  error: { tone: "problem", title: "Resultado não confirmado", action: "contact" },
};

function feedbackFor(mode: ContactMode, kind: FormKind, status: FormStatusValue, reference?: string, retryAfter?: number): Feedback | null {
  if (status === "idle") return null;
  if (mode === "pilot") {
    const message = kind === "contact" ? pilotMessage(status, reference, retryAfter) : kind === "report" ? pilotReportMessage(status, retryAfter) : pilotNewsletterMessage(status, retryAfter);
    const presentation = PILOT_PRESENTATION[status];
    return { ...presentation, title: status === "accepted" && kind === "contact" ? "Recebido" : presentation.title, message };
  }
  if (status === "submitting") return { tone: "progress", title: "Em andamento", message: kind === "contact" ? "Enviando solicitação…" : "Solicitando confirmação…" };
  if (status === "accepted") {
    const message = kind === "contact"
      ? "Demonstração: solicitação aceita localmente. Nenhum dado foi enviado."
      : kind === "newsletter"
        ? "Demonstração: pedido aceito aguardando confirmação. Nenhum dado foi enviado."
        : "Demonstração: pedido de relatório aceito localmente. Nenhum dado foi enviado.";
    return { tone: "info", title: "Demonstração local", message };
  }
  if (status === "error") return { tone: "problem", title: "Erro simulado", message: "Não foi possível concluir a solicitação demonstrativa. Tente novamente. Nenhum dado foi enviado." };
  if (status === "unavailable") return { tone: "info", title: "Envio indisponível", message: "O envio ainda não está disponível. Nenhum dado foi enviado." };
  return null;
}

const ICONS: Record<Tone, ReactNode> = {
  progress: <><circle cx="12" cy="12" r="9" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
  success: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  problem: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></>,
};

// Keep the live node mounted before its first update; idle wrappers have no visual box or layout gap.
export function FormStatus({ mode, status, kind, reference, retryAfter, reviewId, challengeId }: {
  mode: ContactMode; status: FormStatusValue; kind: FormKind; reference?: string; retryAfter?: number; reviewId?: string; challengeId?: string;
}) {
  const feedback = feedbackFor(mode, kind, status, reference, retryAfter);
  return (
    <>
      {mode === "demo" ? <p className={styles.notice}>Demonstração local — nenhum dado é enviado ou guardado.</p> : null}
      <noscript><p>{mode === "pilot" ? "Ative JavaScript para enviar a solicitação, ou use os canais de contato." : "Ative JavaScript para validar este formulário local, ou use os canais de contato."}</p></noscript>
        <div className={feedback ? styles.feedback : styles.emptyFeedback} data-tone={feedback?.tone}>
          {feedback ? <svg className={styles.feedbackIcon} aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[feedback.tone]}</svg> : null}
          <div className={feedback ? styles.feedbackBody : styles.emptyFeedback}>
            {feedback ? <p className={styles.feedbackTitle}>{feedback.title}</p> : null}
            <p role="status" aria-live="polite" aria-atomic="true" className={feedback ? styles.status : "srOnly"}>{feedback?.message ?? ""}</p>
            {feedback?.action === "review" && reviewId ? <button type="button" className={styles.feedbackAction} onClick={() => document.getElementById(reviewId)?.focus()}>Rever os campos</button> : null}
            {feedback?.action === "challenge" && challengeId ? <button type="button" className={styles.feedbackAction} onClick={() => document.getElementById(challengeId)?.focus()}>Ir à verificação</button> : null}
            {feedback?.action === "contact" ? <a className={styles.feedbackAction} href="mailto:contato@roottrust.com.br">Falar com a Root Trust</a> : null}
          </div>
        </div>
    </>
  );
}
