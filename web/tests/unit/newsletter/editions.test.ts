import { describe, expect, it, vi } from "vitest";
import { EDICOES_PUBLICAS } from "../../../src/features/newsletter/catalog";
import { latestOrUnavailable, loadEdicao, loadEdicoes, loadLatestEdicao, toEdicaoPublica } from "../../../src/features/newsletter/source";
import { projectPublicEdition, publishEditionRevision, saveEditionRevision } from "../../../src/lib/server/repository";
import { createFirestoreStore, createMemoryStore, type Store } from "../../../src/lib/server/store";
import { COLLECTIONS, type EditionDraftRecord, type EditionPublicRecord, type EditionRevisionRecord } from "../../../src/lib/server/types";
import { extractOpening, parseEditionInput, type EditionInput } from "../../../src/lib/server/validation";
import { createFakeFirestore, NOW } from "../server/helpers";

const MARKER = "PRIVATE-BODY-MARKER-T41";
const OPENING = "Um backup concluído não prova que a operação consegue voltar. A [orientação da AWS](https://docs.aws.amazon.com/wellarchitected/) ajuda a testar a recuperação.";
const corpo = (extra = MARKER) => `${OPENING}\n\nSegundo parágrafo com ${extra}.\n\n- item\n`;
const body = (overrides: Record<string, unknown> = {}) => ({
  slug: "backup-e-recuperacao",
  data: "2026-10-12",
  pilar: "Cibersegurança",
  titulo: "Backup concluído?",
  corpo: corpo(),
  fontes: [{ titulo: "AWS", href: "https://docs.aws.amazon.com/wellarchitected/" }],
  ...overrides,
});
const parsed = (overrides: Record<string, unknown> = {}): EditionInput => {
  const result = parseEditionInput(body(overrides));
  if (!result.ok) throw new Error(result.fields.join());
  return result.value;
};
const read = <T>(store: Store, collection: (typeof COLLECTIONS)[keyof typeof COLLECTIONS], id: string) => store.transaction((tx) => tx.get<T>(collection, id));
const source = (store: Store, mode: "off" | "demo" | "pilot" = "pilot") => ({ mode, getStore: async () => store });

describe("edition input and N08 opening", () => {
  it("derives the whole first substantive paragraph with links as data", () => {
    expect(extractOpening(corpo())).toStrictEqual([
      { t: "Um backup concluído não prova que a operação consegue voltar. A " },
      { t: "orientação da AWS", href: "https://docs.aws.amazon.com/wellarchitected/" },
      { t: " ajuda a testar a recuperação." },
    ]);
  });

  it("never includes later paragraphs and joins soft line breaks", () => {
    const text = extractOpening("Primeira linha do parágrafo\ncontinua na segunda linha aqui.\n\nOutro parágrafo.")?.map((s) => s.t).join("");
    expect(text).toBe("Primeira linha do parágrafo continua na segunda linha aqui.");
  });

  it.each([
    ["javascript link", "Parágrafo longo o bastante para valer [clique](javascript:alert(1)) como abertura."],
    ["http link", "Parágrafo longo o bastante para valer [clique](http://example.com/a) como abertura."],
    ["image", "Parágrafo longo o bastante para valer ![img](https://example.com/a.png) como abertura."],
    ["credentials", "Parágrafo longo o bastante para valer [x](https://user:pw@example.com/) como abertura."],
    ["url with parentheses (would be truncated)", "Parágrafo longo o bastante para valer [x](https://example.com/a_(b)) como abertura."],
    ["link title", 'Parágrafo longo o bastante para valer [x](https://example.com/a "titulo") como abertura.'],
    ["empty link text", "Parágrafo longo o bastante para valer [](https://example.com/a) como abertura."],
    ["blank link text", "Parágrafo longo o bastante para valer [ ](https://example.com/a) como abertura."],
    ["too short", "Curto."],
    ["structural heading", "# Título interno\n\nParágrafo longo o bastante para valer como abertura de verdade."],
    ["structural list inside the block", "Parágrafo longo o bastante para valer como abertura de verdade.\n- item sem separador"],
    ["excessive length (missing separator)", "Palavra ".repeat(300)],
  ])("rejects an opening with %s", (_name, text) => {
    expect(extractOpening(text)).toBeUndefined();
  });

  it("never skips a short first paragraph to publish the second one", () => {
    expect(extractOpening(`Olá!\n\n${OPENING}`)).toBeUndefined();
  });

  it("accepts exactly the maximum and splits on Unicode whitespace separators", () => {
    const max = "a".repeat(2000);
    expect(extractOpening(max)?.map((s) => s.t).join("")).toBe(max);
    expect(extractOpening("a".repeat(2001))).toBeUndefined();
    for (const separator of ["\n \n", "\n　\n", "  ", "\r\n\r\n"]) {
      const text = extractOpening(`${OPENING}${separator}Segundo parágrafo ${MARKER} nunca entra.`)?.map((s) => s.t).join("");
      expect(text, JSON.stringify(separator)).toContain("ajuda a testar a recuperação.");
      expect(text, JSON.stringify(separator)).not.toContain(MARKER);
    }
  });

  it("keeps Unicode and Markdown punctuation outside links as literal text", () => {
    const segments = extractOpening("Ação **crítica** em _nuvem_: avaliação de risco com [fonte oficial](https://example.com/a?x=1&y=2) — ok.");
    expect(segments?.map((s) => s.t).join("")).toBe("Ação **crítica** em _nuvem_: avaliação de risco com fonte oficial — ok.");
    expect(segments?.find((s) => s.href)?.href).toBe("https://example.com/a?x=1&y=2");
  });

  it("accepts a valid draft and rejects unknown keys, bad slug/date/pilar and non-https sources", () => {
    expect(parseEditionInput(body()).ok).toBe(true);
    const bad: Array<[string, Record<string, unknown>]> = [
      ["extra", { aprovado: true }],
      ["slug", { slug: "Slug Inválido" }],
      ["data", { data: "2026-02-31" }],
      ["data", { data: "9999-99-99" }],
      ["data", { data: "2026-13-45" }],
      ["pilar", { pilar: "Outro" }],
      ["titulo", { titulo: "  " }],
      ["fontes", { fontes: [{ titulo: "x", href: "http://example.com" }] }],
      ["corpo", { corpo: "x".repeat(65 * 1024) }],
    ];
    for (const [field, override] of bad) expect(parseEditionInput(body(override)).ok, field).toBe(false);
    expect(parseEditionInput("texto").ok).toBe(false);
  });
});

describe("private revisions", () => {
  it("writes immutable revisions; regenerating adds a new one and leaves the old text untouched", async () => {
    const store = createMemoryStore();
    const first = await saveEditionRevision(store, parsed(), NOW);
    if (!first.ok) throw new Error("unexpected");
    const before = await read<EditionRevisionRecord>(store, COLLECTIONS.editionRevisions, `${first.draftId}.1`);
    const second = await saveEditionRevision(store, { ...parsed({ corpo: corpo("novo") }), draftId: first.draftId }, new Date(NOW.getTime() + 1000));
    expect(second).toStrictEqual({ ok: true, draftId: first.draftId, revision: 2 });
    expect(await read(store, COLLECTIONS.editionRevisions, `${first.draftId}.1`)).toStrictEqual(before);
    expect(before?.corpo).toContain(MARKER);
    expect(await read<EditionDraftRecord>(store, COLLECTIONS.editionDrafts, first.draftId)).toMatchObject({ currentRevision: 2, status: "pending" });
  });

  it("derives the opening from corpo on write, ignoring a divergent caller-supplied one", async () => {
    const store = createMemoryStore();
    const saved = await saveEditionRevision(store, { ...parsed(), abertura: [{ t: `forjada ${MARKER}` }] }, NOW);
    if (!saved.ok) throw new Error("unexpected");
    const stored = await read<EditionRevisionRecord>(store, COLLECTIONS.editionRevisions, `${saved.draftId}.1`);
    expect(stored?.abertura).toStrictEqual(extractOpening(corpo()));
    expect(await saveEditionRevision(store, { ...parsed(), corpo: `Olá!\n\n${OPENING}` }, NOW)).toStrictEqual({ ok: false, reason: "invalid_body" });
    expect(Object.keys(store.dump(COLLECTIONS.editionDrafts))).toHaveLength(1);
  });

  it("reports an unknown draft and freezes approved drafts", async () => {
    const store = createMemoryStore();
    expect(await saveEditionRevision(store, { ...parsed(), draftId: "ed_missing" }, NOW)).toStrictEqual({ ok: false, reason: "not_found" });
    const saved = await saveEditionRevision(store, parsed(), NOW);
    if (!saved.ok) throw new Error("unexpected");
    expect(await publishEditionRevision(store, saved.draftId, 1, NOW)).toBe("published");
    expect(await saveEditionRevision(store, { ...parsed(), draftId: saved.draftId }, NOW)).toStrictEqual({ ok: false, reason: "approved" });
  });
});

describe("publication (library only, for T4.3)", () => {
  it("publishes nothing on save", async () => {
    const store = createMemoryStore();
    await saveEditionRevision(store, parsed(), NOW);
    expect(store.dump(COLLECTIONS.editionsPublic)).toStrictEqual({});
    expect(await loadEdicoes(source(store))).toStrictEqual([]);
  });

  it("approves only the current revision, exactly once, and the public record never holds the body", async () => {
    const store = createMemoryStore();
    const first = await saveEditionRevision(store, parsed(), NOW);
    if (!first.ok) throw new Error("unexpected");
    await saveEditionRevision(store, { ...parsed({ corpo: corpo("v2") }), draftId: first.draftId }, NOW);
    expect(await publishEditionRevision(store, first.draftId, 1, NOW)).toBe("stale");
    expect(await publishEditionRevision(store, first.draftId, 9, NOW)).toBe("not_found");
    expect(store.dump(COLLECTIONS.editionsPublic)).toStrictEqual({});
    expect(await publishEditionRevision(store, first.draftId, 2, NOW)).toBe("published");
    expect(await publishEditionRevision(store, first.draftId, 2, NOW)).toBe("already");
    const publicRecord = await read<EditionPublicRecord>(store, COLLECTIONS.editionsPublic, "backup-e-recuperacao");
    expect(publicRecord).toMatchObject({ draftId: first.draftId, revision: 2 });
    const dumped = JSON.stringify(store.dump(COLLECTIONS.editionsPublic));
    expect(dumped).not.toContain("Segundo parágrafo");
    expect(dumped).not.toContain(MARKER);
  });

  it("concurrent approvals of the same revision write once", async () => {
    const store = createFirestoreStore(createFakeFirestore() as never);
    const saved = await saveEditionRevision(store, parsed(), NOW);
    if (!saved.ok) throw new Error("unexpected");
    const results = await Promise.all(Array.from({ length: 5 }, () => publishEditionRevision(store, saved.draftId, 1, NOW)));
    expect(results.filter((r) => r === "published")).toHaveLength(1);
    expect(results.filter((r) => r === "already")).toHaveLength(4);
  });

  it("reserves the slug on the first revision, so another draft cannot even be saved with it", async () => {
    const store = createMemoryStore();
    const a = await saveEditionRevision(store, parsed(), NOW);
    if (!a.ok) throw new Error("unexpected");
    expect(await saveEditionRevision(store, parsed(), NOW)).toStrictEqual({ ok: false, reason: "slug_exists" });
    expect(await publishEditionRevision(store, a.draftId, 1, NOW)).toBe("published");
    expect(await saveEditionRevision(store, parsed(), NOW)).toStrictEqual({ ok: false, reason: "slug_exists" });
    expect(Object.keys(store.dump(COLLECTIONS.editionDrafts))).toHaveLength(1);
  });

  it("does not let a draft overwrite a slug that another draft already published", async () => {
    const store = createMemoryStore();
    const b = await saveEditionRevision(store, parsed(), NOW);
    if (!b.ok) throw new Error("unexpected");
    await store.transaction(async (tx) => {
      tx.set(COLLECTIONS.editionsPublic, "backup-e-recuperacao", { draftId: "ed_other", revision: 1, slug: "backup-e-recuperacao" });
    });
    expect(await publishEditionRevision(store, b.draftId, 1, NOW)).toBe("slug_taken");
    expect((await read<EditionPublicRecord>(store, COLLECTIONS.editionsPublic, "backup-e-recuperacao"))?.draftId).toBe("ed_other");
  });

  it("projection copies only allowlisted fields", () => {
    const revision = { id: "x.1", draftId: "x", revision: 1, ...parsed(), createdAt: "t", extraPrivate: MARKER } as unknown as EditionRevisionRecord;
    const record = projectPublicEdition(revision, "now");
    expect(Object.keys(record).sort()).toStrictEqual(["abertura", "data", "draftId", "fontes", "pilar", "publishedAt", "revision", "slug", "titulo"]);
    expect(JSON.stringify(record)).not.toContain(MARKER);
  });
});

describe("public catalog source", () => {
  async function published(store: Store, slug = "backup-e-recuperacao", data = "2026-10-12") {
    const saved = await saveEditionRevision(store, parsed({ slug, data }), NOW);
    if (!saved.ok) throw new Error("unexpected");
    await publishEditionRevision(store, saved.draftId, 1, NOW);
  }

  it("outside pilot serves exactly the labelled demo samples and never touches the store", async () => {
    const getStore = vi.fn(async () => createMemoryStore());
    for (const mode of ["off", "demo"] as const) {
      const edicoes = await loadEdicoes({ mode, getStore });
      expect(edicoes).toStrictEqual(EDICOES_PUBLICAS);
      expect(edicoes.every((e) => e.demo)).toBe(true);
    }
    expect(getStore).not.toHaveBeenCalled();
  });

  it("in pilot never shows the samples as real editions", async () => {
    const store = createMemoryStore();
    expect(await loadEdicoes(source(store))).toStrictEqual([]);
    const demoSlug = EDICOES_PUBLICAS[0]?.slug ?? "";
    expect(demoSlug).not.toBe("");
    expect(await loadEdicao(demoSlug, source(store))).toBeUndefined();
  });

  it("serves approved editions with opening, sources and demo=false, without private fields", async () => {
    const store = createMemoryStore();
    await published(store, "um", "2026-10-10");
    await published(store, "dois", "2026-10-12");
    const edicoes = await loadEdicoes(source(store));
    expect(edicoes.map((e) => e.slug).sort()).toStrictEqual(["dois", "um"]);
    const one = await loadEdicao("dois", source(store));
    expect(one).toMatchObject({ demo: false, pilar: "Cibersegurança", fontes: [{ titulo: "AWS", href: "https://docs.aws.amazon.com/wellarchitected/" }] });
    expect(one?.abertura.map((s) => s.t).join("")).toContain("Um backup concluído");
    expect(JSON.stringify(edicoes)).not.toContain(MARKER);
    expect(JSON.stringify(one)).not.toContain("Segundo parágrafo");
  });

  it("reads the pilot archive with one non-transactional snapshot, newest first", async () => {
    const store = createMemoryStore();
    await published(store, "um", "2026-10-10");
    await published(store, "tres", "2026-10-14");
    await published(store, "dois", "2026-10-12");
    const transaction = vi.spyOn(store, "transaction");
    const latest = vi.spyOn(store, "latest");
    expect((await loadEdicoes(source(store))).map((e) => e.slug)).toStrictEqual(["tres", "dois", "um"]);
    expect(latest).toHaveBeenCalledTimes(1);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("orders the Firestore snapshot by date descending", async () => {
    const store = createFirestoreStore(createFakeFirestore() as never);
    await published(store, "um", "2026-10-10");
    await published(store, "dois", "2026-10-12");
    expect((await loadEdicoes(source(store))).map((e) => e.slug)).toStrictEqual(["dois", "um"]);
  });

  it("rejects public records whose key/slug differ or whose date is invalid", async () => {
    const store = createMemoryStore();
    await published(store);
    const record = (await read<EditionPublicRecord>(store, COLLECTIONS.editionsPublic, "backup-e-recuperacao")) as EditionPublicRecord;
    await store.transaction(async (tx) => {
      tx.set(COLLECTIONS.editionsPublic, "chave-errada", record);
      tx.set(COLLECTIONS.editionsPublic, "data-ruim", { ...record, slug: "data-ruim", data: "2026-99-99" });
    });
    expect((await loadEdicoes(source(store))).map((e) => e.slug)).toStrictEqual(["backup-e-recuperacao"]);
    expect(await loadEdicao("chave-errada", source(store))).toBeUndefined();
    expect(await loadEdicao("data-ruim", source(store))).toBeUndefined();
    expect(await loadEdicao("backup-e-recuperacao", source(store))).toBeDefined();
  });

  it("rejects malformed slugs without reading the store and treats a missing slug as absent", async () => {
    const getStore = vi.fn(async () => createMemoryStore());
    for (const slug of ["", "A", "a b", "../x", "x/y"]) expect(await loadEdicao(slug, { mode: "pilot", getStore }), slug).toBeUndefined();
    expect(getStore).not.toHaveBeenCalled();
    expect(await loadEdicao("inexistente", { mode: "pilot", getStore })).toBeUndefined();
  });

  it("drops tampered public records and ignores unexpected fields such as a body", async () => {
    const store = createMemoryStore();
    await published(store);
    const record = (await read<EditionPublicRecord>(store, COLLECTIONS.editionsPublic, "backup-e-recuperacao")) as EditionPublicRecord;
    await store.transaction(async (tx) => {
      tx.set(COLLECTIONS.editionsPublic, "backup-e-recuperacao", { ...record, corpo: MARKER });
      tx.set(COLLECTIONS.editionsPublic, "link-ruim", { ...record, slug: "link-ruim", fontes: [{ titulo: "x", href: "javascript:alert(1)" }] });
      tx.set(COLLECTIONS.editionsPublic, "pilar-ruim", { ...record, slug: "pilar-ruim", pilar: "Outro" });
    });
    const edicoes = await loadEdicoes(source(store));
    expect(edicoes.map((e) => e.slug)).toStrictEqual(["backup-e-recuperacao"]);
    expect(JSON.stringify(edicoes)).not.toContain(MARKER);
    expect(toEdicaoPublica(undefined)).toBeUndefined();
  });

  it("surfaces a store failure instead of an empty archive or a 404", async () => {
    const getStore = async (): Promise<Store> => {
      throw new Error("store_down");
    };
    await expect(loadEdicoes({ mode: "pilot", getStore })).rejects.toThrow("store_down");
    await expect(loadEdicao("qualquer", { mode: "pilot", getStore })).rejects.toThrow("store_down");
  });
});

describe("landing latest edition", () => {
  it("in pilot reads one snapshot with limit 1 and returns the newest, without a transaction", async () => {
    const store = createMemoryStore();
    for (const [slug, data] of [["um", "2026-10-10"], ["tres", "2026-10-14"], ["dois", "2026-10-12"]]) {
      const saved = await saveEditionRevision(store, parsed({ slug, data }), NOW);
      if (!saved.ok) throw new Error("unexpected");
      await publishEditionRevision(store, saved.draftId, 1, NOW);
    }
    const latest = vi.spyOn(store, "latest");
    const transaction = vi.spyOn(store, "transaction");
    expect((await loadLatestEdicao(source(store)))?.slug).toBe("tres");
    expect(latest).toHaveBeenCalledTimes(1);
    expect(latest).toHaveBeenCalledWith(COLLECTIONS.editionsPublic, "data", 1);
    expect(transaction).not.toHaveBeenCalled();
    expect(await loadLatestEdicao(source(createMemoryStore()))).toBeUndefined();
  });

  it("outside pilot reuses the demo samples without touching the store", async () => {
    const getStore = vi.fn(async () => createMemoryStore());
    expect((await loadLatestEdicao({ mode: "demo", getStore }))?.demo).toBe(true);
    expect(getStore).not.toHaveBeenCalled();
  });

  it("a store failure becomes 'unavailable' for the landing instead of throwing", async () => {
    const getStore = async (): Promise<Store> => {
      throw new Error("store_down");
    };
    await expect(loadLatestEdicao({ mode: "pilot", getStore })).rejects.toThrow("store_down");
    const warn = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await latestOrUnavailable(() => loadLatestEdicao({ mode: "pilot", getStore }))).toStrictEqual({ recente: undefined, indisponivel: true });
    warn.mockRestore();
  });
});
