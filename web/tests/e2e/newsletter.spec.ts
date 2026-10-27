import { expect, test, type Page } from "@playwright/test";
import { EDICOES_PUBLICAS, sortedEdicoes } from "../../src/features/newsletter/catalog";

const [recente, segunda, terceira] = sortedEdicoes();
const OFF = "http://127.0.0.1:3101";

function watch(page: Page) {
  const problems: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname) && url.protocol.startsWith("http")) external.push(request.url());
    if (request.method() !== "GET" && request.method() !== "HEAD") problems.push(`${request.method()} ${request.url()}`);
  });
  return { problems, external };
}

function hrefs(abertura: readonly { href?: string }[]) {
  return abertura.flatMap((s) => (s.href ? [s.href] : []));
}

test("landing: SSR content, single email field and shared opening with links", async ({ page, request }) => {
  const w = watch(page);
  const html = await (await request.get("/newsletter")).text();
  for (const text of ["Análise da Root Trust", "em dias úteis.", "Conheça uma edição.", "Conteúdo para decisões sobre", "a sua operação.", "Como a curadoria", "é preparada.", "Perguntas", "Edição demonstrativa"]) expect(html).toContain(text);
  expect(html).toContain(recente.titulo);
  expect(html).not.toMatch(/inteligência artificial|\bIA\b/i);

  await page.goto("/newsletter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Análise da Root Trust em dias úteis.");
  const form = page.getByRole("form", { name: "Assinar newsletter" });
  await expect(form.locator("input")).toHaveCount(1);
  await expect(form.getByLabel("Seu e-mail", { exact: true })).toBeVisible();
  await expect(form.getByRole("button", { name: "Receber edições completas" })).toBeEnabled();
  await expect(form).toContainText("Se ainda não assina, confirme seu endereço pelo link enviado por e-mail. Depois você recebe a edição mais recente e os próximos envios em dias úteis. Você pode cancelar os próximos envios.");

  const card = page.locator("article").first();
  await expect(card).toContainText(recente.titulo);
  await expect(card).toContainText("Edição demonstrativa — conteúdo para avaliação do design.");
  await expect(card).toContainText(recente.abertura.map((s) => s.t).join(""));
  for (const href of hrefs(recente.abertura)) await expect(card.locator(`a[href="${href}"]`)).toHaveCount(1);
  await expect(card.getByRole("link", { name: /Ler prévia/ })).toHaveAttribute("href", `/newsletter/edicoes/${recente.slug}`);
  await expect(page.getByRole("link", { name: "Ver prévias anteriores" })).toHaveAttribute("href", "/newsletter/edicoes");
  await expect(page.locator("details")).toHaveCount(5);
  expect(w.problems).toEqual([]);
});

test("landing: general request keeps the latest edition and shows demo states", async ({ page }) => {
  const w = watch(page);
  await page.goto("/newsletter");
  const form = page.getByRole("form", { name: "Assinar newsletter" });
  await form.getByRole("button", { name: "Receber edições completas" }).click();
  const email = form.getByLabel("Seu e-mail", { exact: true });
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription("Informe um endereço de e-mail válido.");

  await email.fill("leitor@example.com");
  await form.getByLabel("Resultado da demonstração").selectOption("error");
  await form.getByRole("button", { name: "Receber edições completas" }).click();
  await expect(form.getByRole("status")).toContainText("Não foi possível concluir a solicitação demonstrativa");
  await expect(email).toHaveValue("leitor@example.com");

  await form.getByLabel("Resultado da demonstração").selectOption("success");
  await form.getByRole("button", { name: "Receber edições completas" }).click();
  await expect(form.getByRole("status")).toContainText("pedido aceito aguardando confirmação. Nenhum dado foi enviado.");
  await expect(form.getByRole("status")).not.toContainText(/confirmad|inscrição confirmada|entregue/i);
  await expect(form).toContainText("Demonstração local");
  expect(w.external).toEqual([]);
  expect(w.problems).toEqual([]);
  expect(await page.evaluate(() => ({ l: localStorage.length, s: sessionStorage.length }))).toEqual({ l: 0, s: 0 });
});

test("archive: highlight, two items per page, filters without search, reset to page 1", async ({ page }) => {
  const w = watch(page);
  await page.goto("/newsletter/edicoes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Prévias das edições.");
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  const filters = page.getByRole("navigation", { name: "Filtrar por pilar" });
  await expect(filters.getByRole("link")).toHaveText(["Todos", "Cibersegurança", "Infraestrutura em nuvem", "Software"]);
  await expect(filters.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "page");

  const list = page.getByRole("list").filter({ has: page.locator("article") });
  await expect(list.locator("article")).toHaveCount(2);
  await expect(page.locator("section[aria-labelledby=destaque]")).toContainText(recente.titulo);
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  await expect(page.locator('span[aria-disabled="true"]')).toHaveText("Anterior");

  await page.getByRole("link", { name: "Próxima" }).click();
  await expect(page).toHaveURL(/pagina=2/);
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(list.locator("article")).toHaveCount(1);
  await expect(list.locator("article")).toContainText(terceira.titulo);
  await expect(page.locator("section[aria-labelledby=destaque]")).toContainText(recente.titulo);
  await expect(page.locator('span[aria-disabled="true"]')).toHaveText("Próxima");

  await filters.getByRole("link", { name: "Software" }).click();
  await expect(page).toHaveURL(/pilar=software$/);
  await expect(page.getByText("Página 1 de 1")).toBeVisible();
  await expect(list.locator("article")).toHaveCount(1);
  await expect(list.locator("article")).toContainText(terceira.titulo);
  await expect(page.locator("section[aria-labelledby=destaque]")).toContainText(terceira.titulo);
  await expect(page.getByRole("link", { name: "Conhecer a newsletter" })).toHaveAttribute("href", "/newsletter");

  await page.goto("/newsletter/edicoes?pilar=inexistente&pagina=99");
  await expect(filters.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  expect(w.problems).toEqual([]);
});

test("archive: every item preview matches the catalog opening and links to its edition", async ({ page }) => {
  await page.goto("/newsletter/edicoes");
  for (const edicao of [recente, segunda]) {
    const card = page.locator("ol article").filter({ hasText: edicao.titulo });
    await expect(card).toContainText(edicao.abertura.map((s) => s.t).join(""));
    for (const href of hrefs(edicao.abertura)) await expect(card.locator(`a[href="${href}"]`)).toHaveCount(1);
    await expect(card.getByRole("link", { name: /Ler prévia/ })).toHaveAttribute("href", `/newsletter/edicoes/${edicao.slug}`);
  }
});

for (const edicao of EDICOES_PUBLICAS) {
  test(`preview ${edicao.slug}: one paragraph, source links, chosen edition and back link`, async ({ page, request }) => {
    const w = watch(page);
    const html = await (await request.get(`/newsletter/edicoes/${edicao.slug}`)).text();
    expect(html).toContain(edicao.titulo.replace(/&/g, "&amp;"));
    expect(html).toContain('<meta name="robots" content="noindex, nofollow"');
    for (const other of EDICOES_PUBLICAS.filter((e) => e.slug !== edicao.slug)) expect(html).not.toContain(other.abertura[0].t);
    const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";
    expect(description.length).toBeGreaterThan(20);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(edicao.abertura.map((s) => s.t).join("")).toContain(description.replace(/…$/, ""));

    await page.goto(`/newsletter/edicoes/${edicao.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(edicao.titulo);
    const article = page.locator("article");
    await expect(article).toContainText("Curadoria Root Trust");
    await expect(article).toContainText("Edição demonstrativa — conteúdo para avaliação do design.");
    await expect(article.locator("p").filter({ hasText: edicao.abertura[0].t.slice(0, 40) })).toHaveText(edicao.abertura.map((s) => s.t).join(""));
    for (const href of hrefs(edicao.abertura)) await expect(article.locator(`a[href="${href}"]`)).toHaveCount(1);
    await expect(page.getByRole("link", { name: /anterior|próxima|relacionad/i })).toHaveCount(0);
    const back = page.getByRole("link", { name: "Voltar para todas as edições" });
    await expect(back).toHaveCount(2);
    for (const link of await back.all()) await expect(link).toHaveAttribute("href", "/newsletter/edicoes");
    await expect(page.getByText(`Edição solicitada: ${edicao.titulo}`)).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Receba esta edição completa." })).toBeVisible();
    await expect(page.getByText("Já assina? Você também pode solicitar esta edição aqui.")).toBeVisible();
    await expect(page.getByText("Demonstração local — nenhum dado é enviado ou guardado.")).toBeVisible();

    const form = page.getByRole("form", { name: "Assinar newsletter" });
    const email = form.getByLabel("Seu e-mail", { exact: true });
    await email.fill("leitor@example.com");
    await form.getByRole("button", { name: "Receber esta edição completa" }).click();
    await expect(form.getByRole("status")).toContainText("aguardando confirmação");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(edicao.titulo);
    expect(page.url()).toContain(`/newsletter/edicoes/${edicao.slug}`);
    expect(w.problems).toEqual([]);
  });
}

test("preview: invalid slug returns real HTTP 404 before streaming, in production", async ({ request }) => {
  for (const slug of ["nao-existe", "backup-e-recuperacao%2F..", "BACKUP-E-RECUPERACAO"]) {
    const response = await request.get(`/newsletter/edicoes/${slug}`);
    expect(response.status(), slug).toBe(404);
    expect(await response.text()).not.toContain("Receba esta edição completa.");
  }
});

test("pages are marked noindex and never contain full editorial bodies", async ({ request }) => {
  for (const path of ["/newsletter", "/newsletter/edicoes", ...EDICOES_PUBLICAS.map((e) => `/newsletter/edicoes/${e.slug}`)]) {
    const html = await (await request.get(path)).text();
    expect(html, path).toContain('name="robots" content="noindex, nofollow"');
    expect(html, path).not.toMatch(/references\/editorial|newsletter-editorial/);
  }
});

test("default mode never claims acceptance and sends nothing", async ({ page }) => {
  const w = watch(page);
  await page.goto(`${OFF}/newsletter/edicoes/${recente.slug}`);
  const form = page.getByRole("form", { name: "Assinar newsletter" });
  await expect(form.getByLabel("Resultado da demonstração")).toHaveCount(0);
  await form.getByLabel("Seu e-mail", { exact: true }).fill("leitor@example.com");
  await form.getByRole("button", { name: "Receber esta edição completa" }).click();
  await expect(form.getByRole("status")).toHaveText("O envio ainda não está disponível. Nenhum dado foi enviado.");
  expect(w.problems).toEqual([]);
});

for (const path of ["/newsletter", "/newsletter/edicoes", `/newsletter/edicoes/${recente.slug}`]) {
  test(`${path}: no horizontal overflow at 320px`, async ({ page }) => {
    const w = watch(page);
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(w.problems).toEqual([]);
  });
}

test("catalog routes (demo samples) expose no private revision fields in HTML or RSC and keep the demo label", async ({ request }) => {
  for (const path of ["/newsletter", "/newsletter/edicoes", `/newsletter/edicoes/${recente.slug}`]) {
    for (const headers of [{} as Record<string, string>, { RSC: "1" }]) {
      const text = await (await request.get(path, { headers })).text();
      expect(text, path).not.toMatch(/"corpo"|"draftId"|"currentRevision"|edition_revisions|edition_drafts|editions_public/);
    }
  }
  expect(await (await request.get(`/newsletter/edicoes/${recente.slug}`)).text()).toMatch(/demonstra/i);
  expect((await request.get("/newsletter/edicoes/slug-bem-formado-inexistente")).status()).toBe(404);
});
