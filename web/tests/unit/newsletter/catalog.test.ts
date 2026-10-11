import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  EDICOES_PUBLICAS,
  PILARES,
  getEdicaoBySlug,
  latestEdicao,
  sortedEdicoes,
  type EdicaoPublica,
} from "../../../src/features/newsletter/catalog";

const SOURCE_PATH = fileURLToPath(new URL("../../../../references/claude-design/newsletter-edicoes.js", import.meta.url));
const EDICAO_KEYS = ["abertura", "data", "demo", "id", "pilar", "slug", "titulo"];

function loadSourceEdicoes(): unknown[] {
  const sandbox: { window: { NL_EDICOES?: unknown } } = { window: {} };
  runInNewContext(readFileSync(SOURCE_PATH, "utf8"), sandbox);
  const edicoes = sandbox.window.NL_EDICOES;
  if (!Array.isArray(edicoes)) throw new Error("NL_EDICOES ausente na fonte pública.");
  return JSON.parse(JSON.stringify(edicoes));
}

function fixture(overrides: Partial<EdicaoPublica>): EdicaoPublica {
  return {
    id: "X01",
    slug: "fixture",
    data: "2026-01-01",
    pilar: "Software",
    titulo: "Fixture",
    abertura: [{ t: "Abertura de teste." }],
    demo: true,
    ...overrides,
  };
}

describe("catálogo público da newsletter", () => {
  it("replica exatamente C01–C03 da fonte pública, marcados como demo", () => {
    const source = loadSourceEdicoes();
    expect(EDICOES_PUBLICAS).toHaveLength(3);
    expect(EDICOES_PUBLICAS).toStrictEqual(source.map((edicao) => ({ ...(edicao as object), demo: true })));
  });

  it("aceita somente o schema allowlist, sem corpo completo", () => {
    for (const edicao of EDICOES_PUBLICAS) {
      expect(Object.keys(edicao).sort()).toStrictEqual(EDICAO_KEYS);
      for (const segmento of edicao.abertura) {
        expect(Object.keys(segmento).every((key) => key === "t" || key === "href")).toBe(true);
        expect(segmento.t.length).toBeGreaterThan(0);
      }
    }
  });

  it("valida metadados: id, slug, data real, pilar e título", () => {
    for (const edicao of EDICOES_PUBLICAS) {
      expect(edicao.id).toMatch(/^C\d{2}$/);
      expect(edicao.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(edicao.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${edicao.data}T00:00:00Z`).toISOString().startsWith(edicao.data)).toBe(true);
      expect(PILARES).toContain(edicao.pilar);
      expect(edicao.titulo.trim().length).toBeGreaterThan(0);
    }
  });

  it("não repete id nem slug", () => {
    const ids = EDICOES_PUBLICAS.map((edicao) => edicao.id);
    const slugs = EDICOES_PUBLICAS.map((edicao) => edicao.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("usa somente links https nas aberturas", () => {
    const hrefs = EDICOES_PUBLICAS.flatMap((edicao) => edicao.abertura.flatMap((segmento) => (segmento.href ? [segmento.href] : [])));
    expect(hrefs).toHaveLength(3);
    for (const href of hrefs) expect(new URL(href).protocol).toBe("https:");
  });

  it("ordena por data decrescente sem mutar a entrada", () => {
    expect(sortedEdicoes(EDICOES_PUBLICAS).map((edicao) => edicao.id)).toStrictEqual(["C01", "C02", "C03"]);
    const reversed = [...EDICOES_PUBLICAS].reverse();
    const before = reversed.map((edicao) => edicao.id);
    sortedEdicoes(reversed);
    expect(reversed.map((edicao) => edicao.id)).toStrictEqual(before);
  });

  it("encontra a mais recente e busca por slug exato", () => {
    expect(latestEdicao()?.id).toBe("C01");
    expect(getEdicaoBySlug("autorizacao-nas-integracoes")?.id).toBe("C03");
    expect(getEdicaoBySlug("Backup-e-recuperacao")).toBeUndefined();
    expect(getEdicaoBySlug("inexistente")).toBeUndefined();
  });

  it("aplica os helpers a edições extras somente em fixtures", () => {
    const extras = [
      fixture({ id: "X01", slug: "antiga", data: "2026-01-02" }),
      fixture({ id: "X02", slug: "recente", data: "2026-03-09" }),
      fixture({ id: "X03", slug: "meio", data: "2026-02-15" }),
    ];
    expect(sortedEdicoes(extras).map((edicao) => edicao.slug)).toStrictEqual(["recente", "meio", "antiga"]);
    expect(latestEdicao(extras)?.slug).toBe("recente");
    expect(getEdicaoBySlug("meio", extras)?.id).toBe("X03");
    expect(latestEdicao([])).toBeUndefined();
    expect(EDICOES_PUBLICAS.some((edicao) => edicao.slug.startsWith("fixture") || edicao.id.startsWith("X"))).toBe(false);
  });
});
