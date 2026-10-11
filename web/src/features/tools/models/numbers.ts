/** Entrada numérica de um modelo: `undefined` = vazio, `null` = "Não sei", número (inclusive 0) = valor informado. */
export type Input = number | null | undefined;
export type InputState = "value" | "empty" | "unknown";

export const inputState = (v: Input): InputState => (v === undefined ? "empty" : v === null ? "unknown" : "value");

export type ErrorCode =
  | "invalid_format"
  | "invalid_grouping"
  | "negative"
  | "not_finite"
  | "overflow"
  | "percent_out_of_range"
  | "not_integer"
  | "not_positive"
  | "invalid_choice";

export interface ModelError {
  field: string;
  code: ErrorCode;
  message: string;
}

export interface MissingInput {
  field: string;
  state: "empty" | "unknown";
}

export type ModelOutcome<T> = { ok: false; errors: ModelError[] } | { ok: true; result: T };

const MESSAGES: Record<ErrorCode, string> = {
  invalid_format: "Use apenas dígitos, com vírgula decimal (ex.: 1.234,56).",
  invalid_grouping: "Agrupamento de milhares inválido; use pontos de três em três dígitos (ex.: 1.234.567).",
  negative: "Informe um valor maior ou igual a zero.",
  not_finite: "Informe um número finito.",
  overflow: "O valor excede o limite numérico suportado.",
  percent_out_of_range: "Informe um percentual entre 0 e 100.",
  not_integer: "Informe um número inteiro.",
  not_positive: "Informe um número inteiro maior que zero.",
  invalid_choice: "Escolha uma das opções disponíveis.",
};

export const errorMessage = (code: ErrorCode): string => MESSAGES[code];
export const modelError = (field: string, code: ErrorCode): ModelError => ({ field, code, message: MESSAGES[code] });

export type ParseResult =
  | { kind: "empty" }
  | { kind: "value"; value: number }
  | { kind: "error"; code: ErrorCode; message: string };

export interface ParseOptions {
  percent?: boolean;
  integer?: boolean;
}

const NUMBER_PT_BR = /^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:\.\d{3})+)(?:,\d+)?$/;
const fail = (code: ErrorCode): ParseResult => ({ kind: "error", code, message: MESSAGES[code] });

/** Analisa texto pt-BR: "." só como milhar (grupos de 3), "," como decimal. Aceita prefixo "R$" e sufixo "%" (com `percent`). */
export function parsePtBR(text: string, options: ParseOptions = {}): ParseResult {
  let s = text.trim();
  if (s === "") return { kind: "empty" };
  s = s.replace(/^R\$\s*/, "");
  if (options.percent) s = s.replace(/\s*%$/, "");
  if (/^[-−–]/.test(s)) return fail("negative");
  if (/^[+]?(?:infinity|nan)$/i.test(s)) return fail("not_finite");
  if (!NUMBER_PT_BR.test(s)) return fail(/^\d[\d.]*(?:,\d+)?$/.test(s) && s.includes(".") ? "invalid_grouping" : "invalid_format");
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(n)) return fail("overflow");
  if (options.integer && !Number.isInteger(n)) return fail("not_integer");
  if (options.percent && n > 100) return fail("percent_out_of_range");
  return { kind: "value", value: n };
}

export interface CheckOptions {
  percent?: boolean;
  integer?: boolean;
  positive?: boolean;
}

/** Valida um número já convertido (ignora vazio/desconhecido). */
export function checkValue(field: string, v: Input, options: CheckOptions = {}): ModelError | undefined {
  if (typeof v !== "number") return undefined;
  if (!Number.isFinite(v)) return modelError(field, "not_finite");
  if (v < 0) return modelError(field, "negative");
  if (options.integer && !Number.isInteger(v)) return modelError(field, "not_integer");
  if (options.positive && v <= 0) return modelError(field, "not_positive");
  if (options.percent && v > 100) return modelError(field, "percent_out_of_range");
  return undefined;
}

/** Resultado de cálculo por indicador: valor, entradas faltantes, indefinido (denominador zero etc.) ou estouro numérico. */
export type Calc =
  | { status: "value"; value: number }
  | { status: "missing"; missing: MissingInput[] }
  | { status: "undefined"; reason: string }
  | { status: "overflow" };

export const val = (value: number): Calc => ({ status: "value", value });
export const undef = (reason: string): Calc => ({ status: "undefined", reason });
export const OVERFLOW: Calc = { status: "overflow" };

/** Resultado finito e sem perda total por underflow; caso contrário `null`. */
export function safe(result: number, ...operands: number[]): number | null {
  if (!Number.isFinite(result)) return null;
  if (result === 0 && operands.length > 0 && operands.every((o) => o !== 0) && operands.some((o) => Math.abs(o) < 1)) return null;
  return result;
}

export const mul = (a: number, b: number): number | null => safe(a * b, a, b);
export const div = (a: number, b: number): number | null => safe(a / b, a);
export const add = (a: number, b: number): number | null => safe(a + b);

/** Múltiplo de Number.EPSILON tolerado como erro de representação em cadeias curtas de operações. */
const CANCELLATION_ULPS = 16;

/** a − b; diferença dentro do erro de representação dos operandos vira 0 exato (não arredonda a centavos). */
export function sub(a: number, b: number): number | null {
  const d = a - b;
  if (!Number.isFinite(d)) return null;
  return Math.abs(d) <= CANCELLATION_ULPS * Number.EPSILON * Math.max(Math.abs(a), Math.abs(b)) ? 0 : d;
}
