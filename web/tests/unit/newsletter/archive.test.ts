import { describe, expect, it } from "vitest";
import {
  PAGE_SIZE,
  archiveHref,
  buildArchiveView,
  formatData,
  parseFiltro,
  parsePagina,
} from "../../../src/features/newsletter/archive";
import { EDICOES_PUBLICAS, PILARES, type EdicaoPublica } from "../../../src/features/newsletter/catalog";

function fixture(id: number, pilar: EdicaoPublica["pilar"]): EdicaoPublica {
  return {
    id: `F${id}`,
    slug: `fixture-${id}`,
    data: `2026-09-${String(10 + id).padStart(2, "0")}`,
    pilar,
    titulo: `Fixture ${id}`,
    abertura: [{ t: `Abertura ${id}.` }],
    demo: true,
  };
}

const FIXTURES = [
  fixture(1, PILARES[0]), fixture(2, PILARES[1]), fixture(3, PILARES[0]),
  fixture(4, PILARES[2]), fixture(5, PILARES[0]),
];

describe("archive view", () => {
  it("uses two items per page, newest first, with the newest as highlight", () => {
    expect(PAGE_SIZE).toBe(2);
    const p1 = buildArchiveView(FIXTURES, "todos", 1);
    expect(p1.itens.map((e) => e.id)).toEqual(["F5", "F4"]);
    expect(p1.destaque?.id).toBe("F5");
    expect(p1.totalPaginas).toBe(3);
    const p3 = buildArchiveView(FIXTURES, "todos", 3);
    expect(p3.itens.map((e) => e.id)).toEqual(["F1"]);
    expect(p3.destaque?.id).toBe("F5");
  });

  it("filters by pillar and highlights the newest of the active filter", () => {
    const view = buildArchiveView(FIXTURES, "ciberseguranca", 1);
    expect(view.total).toBe(3);
    expect(view.itens.map((e) => e.id)).toEqual(["F5", "F3"]);
    const nuvem = buildArchiveView(FIXTURES, "infraestrutura-em-nuvem", 1);
    expect(nuvem.destaque?.id).toBe("F2");
    expect(nuvem.totalPaginas).toBe(1);
  });

  it("clamps out-of-range pages and handles empty filters", () => {
    expect(buildArchiveView(FIXTURES, "todos", 99).pagina).toBe(3);
    expect(buildArchiveView(FIXTURES, "todos", -4).pagina).toBe(1);
    const vazio = buildArchiveView([], "todos", 5);
    expect(vazio).toMatchObject({ total: 0, pagina: 1, totalPaginas: 1, destaque: undefined, itens: [] });
    expect(buildArchiveView(FIXTURES.filter((e) => e.pilar !== PILARES[2]), "software", 1).destaque).toBeUndefined();
  });

  it("shows the catalog demo set as 2 + 1 and one entry per pillar", () => {
    const todos = buildArchiveView(EDICOES_PUBLICAS, "todos", 1);
    expect(todos.itens).toHaveLength(2);
    expect(buildArchiveView(EDICOES_PUBLICAS, "todos", 2).itens).toHaveLength(1);
    for (const key of ["ciberseguranca", "infraestrutura-em-nuvem", "software"] as const) {
      expect(buildArchiveView(EDICOES_PUBLICAS, key, 1).total).toBe(1);
    }
  });
});

describe("archive query", () => {
  it("accepts only known filters and positive integer pages", () => {
    expect(parseFiltro("software")).toBe("software");
    expect(parseFiltro("busca")).toBe("todos");
    expect(parseFiltro(["software", "x"])).toBe("software");
    expect(parseFiltro(undefined)).toBe("todos");
    expect(parsePagina("2")).toBe(2);
    for (const bad of ["0", "-1", "1.5", "abc", "", "9999999999", undefined]) expect(parsePagina(bad)).toBe(1);
  });

  it("builds links that reset to page 1 when the filter changes", () => {
    expect(archiveHref("todos")).toBe("/newsletter/edicoes");
    expect(archiveHref("software")).toBe("/newsletter/edicoes?pilar=software");
    expect(archiveHref("software", 2)).toBe("/newsletter/edicoes?pilar=software&pagina=2");
    expect(archiveHref("todos", 2)).toBe("/newsletter/edicoes?pagina=2");
  });

  it("formats ISO dates without timezone shifts", () => {
    expect(formatData("2026-10-07")).toBe("07/10/2026");
  });
});
