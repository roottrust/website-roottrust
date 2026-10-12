export type ChallengeState = "idle" | "loading" | "ready" | "solved" | "expired" | "timeout" | "failed";

const MESSAGES: Record<ChallengeState, string> = {
  idle: "A verificação de segurança é carregada quando você começa a preencher o formulário. O envio fica desativado até que ela seja concluída.",
  loading: "Carregando a verificação de segurança… O envio fica desativado até que ela seja concluída.",
  ready: "Conclua a verificação de segurança para liberar o envio.",
  solved: "Verificação de segurança concluída. Você já pode enviar a solicitação.",
  expired: "A verificação expirou. Refaça a verificação para liberar o envio.",
  timeout: "A verificação demorou demais para responder. Tente novamente para liberar o envio.",
  failed: "Não foi possível carregar a verificação de segurança. Tente novamente ou use os canais de contato.",
};

export const challengeMessage = (state: ChallengeState): string => MESSAGES[state];
export const canRetryChallenge = (state: ChallengeState): boolean => state === "failed" || state === "expired" || state === "timeout";
