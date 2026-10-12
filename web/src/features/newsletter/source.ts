import { logEvent } from "../../lib/server/safe";
import type { BackendMode } from "../../lib/server/mode";
import type { Store } from "../../lib/server/store";
import { COLLECTIONS, type EditionPublicRecord } from "../../lib/server/types";
import { checkHttpsUrl, isEditionSlug, isIsoDate } from "../../lib/server/validation";
import { EDICOES_PUBLICAS, latestEdicao, PILARES, type EdicaoPublica, type FonteEdicao, type Pilar, type SegmentoAbertura } from "./catalog";

const MAX_EDITIONS = 500;

// Re-validates and copies field by field: a tampered or legacy record can neither break the page nor smuggle extra
// fields (e.g. a body) into props. Returns undefined for anything malformed.
export function toEdicaoPublica(record: EditionPublicRecord | undefined, key?: string): EdicaoPublica | undefined {
  if (!record || !isEditionSlug(record.slug) || (key !== undefined && record.slug !== key) || !isIsoDate(record.data) || !PILARES.includes(record.pilar as Pilar)) return undefined;
  if (typeof record.titulo !== "string" || !Array.isArray(record.abertura) || !Array.isArray(record.fontes)) return undefined;
  const abertura: SegmentoAbertura[] = [];
  for (const segmento of record.abertura) {
    if (typeof segmento?.t !== "string") return undefined;
    const href = segmento.href === undefined ? undefined : checkHttpsUrl(segmento.href);
    if (segmento.href !== undefined && !href) return undefined;
    abertura.push(href ? { t: segmento.t, href } : { t: segmento.t });
  }
  const fontes: FonteEdicao[] = [];
  for (const fonte of record.fontes) {
    const href = checkHttpsUrl(fonte?.href);
    if (typeof fonte?.titulo !== "string" || !href) return undefined;
    fontes.push({ titulo: fonte.titulo, href });
  }
  return { id: record.slug, slug: record.slug, data: record.data, pilar: record.pilar as Pilar, titulo: record.titulo, abertura, fontes, demo: false };
}

interface Source {
  mode: BackendMode;
  getStore(): Promise<Store>;
}

// Outside `pilot` the site shows the three labelled demo samples; in `pilot` only approved, published editions (never the
// samples). A store failure throws: an unreadable catalog must not look like an empty archive or a missing edition.
// Pilot archive: one non-transactional snapshot query (newest first, up to MAX_EDITIONS), so it never holds locks that could
// delay a publication. Read cost per archive view and quota at scale are measured in T6.2.
export async function loadEdicoes({ mode, getStore }: Source): Promise<EdicaoPublica[]> {
  if (mode !== "pilot") return [...EDICOES_PUBLICAS];
  const store = await getStore();
  const documents = await store.latest<EditionPublicRecord>(COLLECTIONS.editionsPublic, "data", MAX_EDITIONS);
  return documents.flatMap(({ id, data }) => {
    const edicao = toEdicaoPublica(data, id);
    if (!edicao) logEvent("warn", "edition_record_invalid");
    return edicao ? [edicao] : [];
  });
}

export async function loadEdicao(slug: string, { mode, getStore }: Source): Promise<EdicaoPublica | undefined> {
  if (!isEditionSlug(slug)) return undefined;
  if (mode !== "pilot") return EDICOES_PUBLICAS.find((edicao) => edicao.slug === slug);
  const store = await getStore();
  return toEdicaoPublica(await store.transaction((tx) => tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, slug)), slug);
}

// Landing only needs the newest edition: in pilot a single-document snapshot (limit 1) instead of the whole archive.
// If that newest record is malformed nothing is shown (never an older one in its place), and the failure is logged.
export async function loadLatestEdicao({ mode, getStore }: Source): Promise<EdicaoPublica | undefined> {
  if (mode !== "pilot") return latestEdicao(EDICOES_PUBLICAS);
  const store = await getStore();
  const [document] = await store.latest<EditionPublicRecord>(COLLECTIONS.editionsPublic, "data", 1);
  if (!document) return undefined;
  const edicao = toEdicaoPublica(document.data, document.id);
  if (!edicao) logEvent("warn", "edition_record_invalid");
  return edicao;
}

// A catalog failure must not take the landing's CTA/form down: report it as unavailable instead of throwing.
export async function latestOrUnavailable(load: () => Promise<EdicaoPublica | undefined>): Promise<{ recente: EdicaoPublica | undefined; indisponivel: boolean }> {
  try {
    return { recente: await load(), indisponivel: false };
  } catch {
    logEvent("error", "newsletter_catalog_unavailable");
    return { recente: undefined, indisponivel: true };
  }
}
