const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PERCENT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const NUMBER = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export const brl = (v: number): string => (v < 0 && Math.round(Math.abs(v) * 100) > 0 ? "−" : "") + BRL.format(Math.abs(v));
export const pct = (v: number): string => (v < 0 && Math.abs(v) >= 0.05 ? "−" : "") + PERCENT.format(Math.abs(v)) + "%";
export const num = (v: number): string => NUMBER.format(v);
