import { PILARES, sortedEdicoes, type EdicaoPublica, type Pilar } from "./catalog";

export const PAGE_SIZE = 2;

export const FILTROS = [
  { key: "todos", label: "Todos", pilar: undefined },
  { key: "ciberseguranca", label: PILARES[0], pilar: PILARES[0] },
  { key: "infraestrutura-em-nuvem", label: PILARES[1], pilar: PILARES[1] },
  { key: "software", label: PILARES[2], pilar: PILARES[2] },
] as const satisfies readonly { key: string; label: string; pilar: Pilar | undefined }[];

export type FiltroKey = (typeof FILTROS)[number]["key"];

export interface ArchiveView {
  readonly filtro: FiltroKey;
  readonly pagina: number;
  readonly totalPaginas: number;
  readonly destaque: EdicaoPublica | undefined;
  readonly itens: readonly EdicaoPublica[];
  readonly total: number;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFiltro(value: string | string[] | undefined): FiltroKey {
  const raw = first(value);
  return FILTROS.find((f) => f.key === raw)?.key ?? "todos";
}

export function parsePagina(value: string | string[] | undefined): number {
  const raw = first(value);
  return raw !== undefined && /^[1-9]\d{0,5}$/.test(raw) ? Number(raw) : 1;
}

export function buildArchiveView(
  edicoes: readonly EdicaoPublica[],
  filtro: FiltroKey,
  pagina: number,
  pageSize: number = PAGE_SIZE,
): ArchiveView {
  const pilar = FILTROS.find((f) => f.key === filtro)?.pilar;
  const filtradas = sortedEdicoes(edicoes).filter((e) => !pilar || e.pilar === pilar);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / pageSize));
  const atual = Math.min(Math.max(1, pagina), totalPaginas);
  return {
    filtro,
    pagina: atual,
    totalPaginas,
    destaque: filtradas[0],
    itens: filtradas.slice((atual - 1) * pageSize, atual * pageSize),
    total: filtradas.length,
  };
}

export function archiveHref(filtro: FiltroKey, pagina = 1): string {
  const params = new URLSearchParams();
  if (filtro !== "todos") params.set("pilar", filtro);
  if (pagina > 1) params.set("pagina", String(pagina));
  const query = params.toString();
  return query ? `/newsletter/edicoes?${query}` : "/newsletter/edicoes";
}

export function formatData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function aberturaTexto(edicao: EdicaoPublica): string {
  return edicao.abertura.map((s) => s.t).join("");
}
