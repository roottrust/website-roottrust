import { describe, expect, it, vi } from "vitest";
import { handleNewsletterDraft } from "../../../src/lib/server/http";
import { setup } from "../server/helpers";

// The script is plain ESM (.mjs) with no types; a variable specifier keeps tsc from requiring a declaration.
const SCRIPT = "../../../ops/newsletter-routine/post-draft.mjs";
type Script = {
  DRAFT_PATH: string;
  signDraft: (key: string, parts: { timestamp: number; nonce: string; body: Uint8Array }) => string;
  buildDraftRequest: (input: { origin: string; key: string; body: string; now?: number; nonce?: string }) => { url: string; init: RequestInit };
  postDraft: (input: { origin: string; key: string; body: string; fetcher?: typeof fetch }) => Promise<{ status: number; code?: string; draftId?: string; revision?: number }>;
};
const load = async (): Promise<Script> => (await import(/* @vite-ignore */ SCRIPT)) as Script;

const KEY = "d".repeat(40);
const draft = JSON.stringify({
  slug: "edicao-rotina",
  data: "2026-10-13",
  pilar: "Software",
  titulo: "Título",
  corpo: "Abertura completa com [fonte](https://exemplo.org/a) citada e contexto suficiente.\n\nResto privado.",
  fontes: [{ titulo: "Fonte", href: "https://exemplo.org/a" }],
});

describe("Routine draft script", () => {
  it("builds a request the draft endpoint authenticates with the draft key, and only with it", async () => {
    const { buildDraftRequest, DRAFT_PATH } = await load();
    const base = setup();
    const deps = { ...base.deps, newsletter: { botToken: "b".repeat(30), applicationId: "111111111111111111", guildId: "222222222222222222", channelId: "333333333333333333" } };
    const built = buildDraftRequest({ origin: "https://site.example", key: KEY, body: draft, now: base.deps.now?.().getTime() });
    expect(built.url).toBe(`https://site.example${DRAFT_PATH}`);
    const asDraft = await handleNewsletterDraft(
      new Request(`http://localhost${DRAFT_PATH}`, { method: "POST", headers: built.init.headers, body: built.init.body as BodyInit }),
      { ...deps, internalKeys: { draft: [KEY] } },
    );
    expect(asDraft.status).toBe(202);
    const wrongScope = buildDraftRequest({ origin: "https://site.example", key: KEY, body: draft, now: base.deps.now?.().getTime(), nonce: "other-nonce-000000001" });
    const asPublish = await handleNewsletterDraft(
      new Request(`http://localhost${DRAFT_PATH}`, { method: "POST", headers: wrongScope.init.headers, body: wrongScope.init.body as BodyInit }),
      { ...deps, internalKeys: { publish: [KEY] } },
    );
    expect(asPublish.status).toBe(503);
  });

  it("requires https (http only for localhost) and a key of at least 32 characters", async () => {
    const { buildDraftRequest } = await load();
    expect(() => buildDraftRequest({ origin: "http://site.example", key: KEY, body: draft })).toThrow("https");
    expect(() => buildDraftRequest({ origin: "http://localhost:3000", key: KEY, body: draft })).not.toThrow();
    expect(() => buildDraftRequest({ origin: "https://site.example", key: "short", body: draft })).toThrow("too short");
    expect(() => buildDraftRequest({ origin: "https://site.example", key: undefined as unknown as string, body: draft })).toThrow("too short");
  });

  it("reports only status, code and ids, never the key or the draft text, and does not follow redirects", async () => {
    const { postDraft } = await load();
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({ draftId: "ed_x", revision: 1, status: "queued", extra: "Resto privado." }, { status: 202 }));
    const result = await postDraft({ origin: "https://site.example", key: KEY, body: draft, fetcher });
    expect(result).toEqual({ status: 202, code: undefined, draftId: "ed_x", revision: 1 });
    expect(JSON.stringify(result)).not.toContain(KEY);
    expect(fetcher.mock.calls[0][1]?.redirect).toBe("error");
    expect(JSON.stringify(fetcher.mock.calls[0][1]?.headers)).not.toContain(KEY);
    const conflict = await postDraft({ origin: "https://site.example", key: KEY, body: draft, fetcher: async () => Response.json({ code: "slug_exists" }, { status: 409 }) });
    expect(conflict).toMatchObject({ status: 409, code: "slug_exists" });
    const html = await postDraft({ origin: "https://site.example", key: KEY, body: draft, fetcher: async () => new Response("<html>", { status: 502 }) });
    expect(html).toEqual({ status: 502, code: undefined, draftId: undefined, revision: undefined });
  });

  it("fails locally on malformed JSON without calling the network", async () => {
    const { postDraft } = await load();
    const fetcher = vi.fn<typeof fetch>();
    await expect(postDraft({ origin: "https://site.example", key: KEY, body: "{nope", fetcher })).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
