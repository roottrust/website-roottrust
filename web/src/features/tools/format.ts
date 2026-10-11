const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PERCENT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const NUMBER = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const EXACT = new Intl.NumberFormat("pt-BR", { maximumSignificantDigits: 21, useGrouping: true });
const MINUS = "−";

/** Valor não nulo que arredondaria para zero nunca é exibido como zero nem perde o sinal: usa limiar explícito. */
function signed(v: number, format: (n: number) => string, floor: string): string {
  const text = format(Math.abs(v));
  if (v !== 0 && Number.isFinite(v) && !/[1-9]/.test(text)) return v < 0 ? `> ${MINUS}${floor}` : `< ${floor}`;
  return (v < 0 ? MINUS : "") + text;
}

export const brl = (v: number): string => signed(v, (n) => BRL.format(n), BRL.format(0.01));
export const pct = (v: number): string => signed(v, (n) => `${PERCENT.format(n)}%`, `${PERCENT.format(0.1)}%`);
export const num = (v: number): string => NUMBER.format(v);

/** Número → texto pt-BR sem perda de precisão (releitura por `parsePtBR` devolve o mesmo número). */
export const exactText = (v: number): string => EXACT.format(v);
