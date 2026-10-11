import { expect, test, type Page } from "@playwright/test";
import { sortedEdicoes } from "../../src/features/newsletter/catalog";

const ROUTES: [string, string][] = [
  ["/", "Root Trust — Confiabilidade com profundidade"],
  ["/servicos/ciberseguranca", "Cibersegurança e Pentest · Root Trust"],
  ["/servicos/infraestrutura-em-nuvem", "Infraestrutura em nuvem · Root Trust"],
  ["/servicos/desenvolvimento-de-software", "Software e desenvolvimento sob medida · Root Trust"],
  ["/ferramentas/rosi", "ROSI: retorno de uma proteção adicional · Root Trust"],
  ["/ferramentas/shadow-ai", "Shadow AI: governança do uso de IA · Root Trust"],
  ["/ferramentas/divida-tecnica", "Dívida técnica: custo do tempo atribuído · Root Trust"],
  ["/ferramentas/migracao-para-nuvem", "Migração para nuvem: comparação de custos · Root Trust"],
  ["/newsletter", "Newsletter — Root Trust"],
  ["/newsletter/edicoes", "Prévias da newsletter — Root Trust"],
  ["/privacidade", "Privacidade — Root Trust"],
];

function watch(page: Page, expected404 = "") {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (expected404 && message.location().url.endsWith(expected404)) return;
    problems.push(message.text());
  });
  return problems;
}

test("every public route has a distinct title, description and inherited noindex", async ({ request }) => {
  const titles = new Set<string>();
  for (const [path, title] of ROUTES) {
    const html = await (await request.get(path)).text();
    expect(html, path).toContain(`<title>${title}</title>`);
    expect(html, path).toMatch(/<meta name="description" content="[^"]{20,}"/);
    expect(html, path).toMatch(/<meta name="robots" content="noindex, nofollow"/);
    expect(html, path).not.toContain('rel="canonical"');
    titles.add(title);
  }
  expect(titles.size).toBe(ROUTES.length);
  const preview = sortedEdicoes()[0];
  const html = await (await request.get(`/newsletter/edicoes/${preview.slug}`)).text();
  expect(html).toContain(`<title>${preview.titulo} — Prévia · Root Trust</title>`);
  expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
});

test("arbitrary URL and invalid newsletter slug return HTTP 404 with the native page", async ({ request }) => {
  for (const path of ["/nao-existe-qualquer-coisa", "/servicos/inexistente/profundo", "/newsletter/edicoes/slug-invalido"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    const html = await response.text();
    expect(html, path).toContain("não encontrada.");
    expect(html, path).toContain("O endereço pode estar incorreto ou a página pode não estar disponível.");
    expect(html, path).toContain("<title>Página não encontrada — Root Trust</title>");
    expect(html, path).toMatch(/<meta name="robots" content="noindex/);
  }
});

test("404 page: SSR content, exits to Home and services, art decorative", async ({ page }) => {
  const problems = watch(page, "/pagina-que-nao-existe");
  const response = await page.goto("/pagina-que-nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada.");
  const home = page.getByRole("main").getByRole("link", { name: "Voltar à Home" });
  await expect(home).toHaveAttribute("href", "/");
  await expect(page.getByRole("main").getByRole("link", { name: "Conhecer os serviços" })).toHaveAttribute("href", "/#servicos");
  await expect(page.getByRole("main").getByRole("link", { name: "Solicitar diagnóstico" })).toHaveAttribute("href", "/#contato");
  await expect(page.locator("canvas[data-graphic='not-found']")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("canvas[data-graphic='not-found']")).toHaveAttribute("data-graphic-status", "ready");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await home.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Confiabilidade com profundidade.");
  expect(problems).toEqual([]);
});

test("404 keeps essential content without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto("/pagina-que-nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada.");
  await expect(page.getByRole("main").getByRole("link", { name: "Voltar à Home" })).toBeVisible();
  await context.close();
});

test("privacy: provisional and truthful, no JS needed, no overflow at 320px", async ({ page, browser, request }) => {
  const problems = watch(page);
  const html = await (await request.get("/privacidade")).text();
  for (const text of ["Privacidade e uso de dados.", "Conteúdo de privacidade em preparação para revisão.", "Nenhum dado é enviado, recebido, armazenado", "memória do navegador", "contato@roottrust.com.br"]) expect(html).toContain(text);

  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/privacidade");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacidade e uso de dados.");
  expect(await page.locator("main").innerText()).not.toMatch(/CNPJ|encarregado|DPO|LGPD|banner de cookies/i);
  await expect(page.getByRole("note")).toContainText("Esta página é provisória");
  await expect(page.getByRole("link", { name: "contato@roottrust.com.br" })).toHaveAttribute("href", "mailto:contato@roottrust.com.br");
  await expect(page.getByRole("link", { name: "11 94008-4692" })).toHaveAttribute("href", "tel:+5511940084692");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const empty = await page.locator("main a").evaluateAll((links) => links.filter((a) => { const href = a.getAttribute("href"); return !href || href === "#"; }).length);
  expect(empty).toBe(0);
  await page.getByRole("main").getByRole("link", { name: "Voltar à Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(problems).toEqual([]);

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const plain = await noJs.newPage();
  await plain.goto("/privacidade");
  await expect(plain.getByRole("heading", { level: 1 })).toHaveText("Privacidade e uso de dados.");
  await expect(plain.getByRole("heading", { name: "Ferramentas de cálculo" })).toBeVisible();
  await noJs.close();
});

test("footer privacy link and Home archive link reach real routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ver edições anteriores" }).click();
  await expect(page).toHaveURL(/\/newsletter\/edicoes$/);
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacidade" }).click();
  await expect(page).toHaveURL(/\/privacidade$/);
});
