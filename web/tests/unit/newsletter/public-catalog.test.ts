import { describe, expect, it, vi } from "vitest";
import { EDICOES_PUBLICAS } from "../../../src/features/newsletter/catalog";
import { loadEdicao, loadEdicoes, loadLatestEdicao } from "../../../src/features/newsletter/source";
import { createMemoryStore } from "../../../src/lib/server/store";
import { COLLECTIONS, type EditionPublicRecord } from "../../../src/lib/server/types";

const record = (slug: string, data: string): EditionPublicRecord => ({
  slug, data, pilar: "Software", titulo: `Edição ${slug}`,
  abertura: [{ t: "Primeiro parágrafo público." }],
  fontes: [{ titulo: "Fonte", href: "https://exemplo.org/a" }],
  draftId: "ed_00000000-0000-4000-8000-000000000001", revision: 1, publishedAt: `${data}T10:00:00.000Z`,
});

async function seeded() {
  const store = createMemoryStore();
  await store.transaction(async (tx) => {
    tx.set(COLLECTIONS.editionsPublic, "edicao-antiga", record("edicao-antiga", "2026-10-01"));
    tx.set(COLLECTIONS.editionsPublic, "edicao-nova", record("edicao-nova", "2026-10-15"));
  });
  return { store, getStore: vi.fn(async () => store) };
}

describe("public catalog", () => {
  it("reads the real projection, newest first, and never the demo fixtures", async () => {
    const { getStore } = await seeded();
    const list = await loadEdicoes({ mode: "public", getStore });
    expect(list.map((edicao) => edicao.slug)).toEqual(["edicao-nova", "edicao-antiga"]);
    expect(list.every((edicao) => edicao.demo === false)).toBe(true);
    expect(list.some((edicao) => EDICOES_PUBLICAS.some((demo) => demo.slug === edicao.slug))).toBe(false);
    expect((await loadLatestEdicao({ mode: "public", getStore }))?.slug).toBe("edicao-nova");
    expect((await loadEdicao("edicao-antiga", { mode: "public", getStore }))?.titulo).toBe("Edição edicao-antiga");
  });

  it("an empty public archive is empty, not the demo samples, and a demo slug is not found", async () => {
    const getStore = vi.fn(async () => createMemoryStore());
    expect(await loadEdicoes({ mode: "public", getStore })).toEqual([]);
    expect(await loadLatestEdicao({ mode: "public", getStore })).toBeUndefined();
    expect(await loadEdicao(EDICOES_PUBLICAS[0].slug, { mode: "public", getStore })).toBeUndefined();
  });

  it("exposes only the editorial opening and sources, never a body field", async () => {
    const { store, getStore } = await seeded();
    await store.transaction(async (tx) => tx.set(COLLECTIONS.editionsPublic, "edicao-vazada", { ...record("edicao-vazada", "2026-10-20"), corpo: "CORPO PRIVADO" }));
    const list = await loadEdicoes({ mode: "public", getStore });
    expect(JSON.stringify(list)).not.toContain("CORPO PRIVADO");
  });

  it("an unreadable store fails loudly instead of looking empty", async () => {
    const getStore = vi.fn(async () => { throw new Error("down"); });
    await expect(loadEdicoes({ mode: "public", getStore })).rejects.toThrow();
  });

  it("demo and off keep the labelled samples without touching storage", async () => {
    const getStore = vi.fn(async () => createMemoryStore());
    for (const mode of ["demo", "off"] as const) {
      expect(await loadEdicoes({ mode, getStore })).toEqual([...EDICOES_PUBLICAS]);
    }
    expect(getStore).not.toHaveBeenCalled();
  });
});
