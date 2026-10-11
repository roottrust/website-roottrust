import { createServer, type Server } from "node:http";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { sortedEdicoes } from "../../src/features/newsletter/catalog";

/**
 * Evidence capture, not a regression check: is excluded by playwright.config.ts unless QA_CAPTURE=1 (see web/scripts/qa-capture.mjs).
 * Native route vs the approved export (served read-only), same viewport, reduced motion, fonts loaded.
 */
test.use({ deviceScaleFactor: 1, reducedMotion: "reduce" });

const OUT = fileURLToPath(new URL("../../../references/audits/final-qa/captures", import.meta.url));
const EXPORTS_ROOT = fileURLToPath(new URL("../../../references/claude-design", import.meta.url));
const TYPES: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".json": "application/json" };
const PAIRS = [
  { id: "servico-ciberseguranca", route: "/servicos/ciberseguranca", file: "Servico Ciberseguranca.dc.html" },
  { id: "servico-nuvem", route: "/servicos/infraestrutura-em-nuvem", file: "Servico Infraestrutura em nuvem.dc.html" },
  { id: "servico-software", route: "/servicos/desenvolvimento-de-software", file: "Servico Software.dc.html" },
  { id: "ferramenta-rosi", route: "/ferramentas/rosi", file: "Ferramenta ROSI.dc.html" },
  { id: "ferramenta-shadow-ai", route: "/ferramentas/shadow-ai", file: "Ferramenta Shadow AI.dc.html" },
  { id: "ferramenta-divida-tecnica", route: "/ferramentas/divida-tecnica", file: "Ferramenta Divida tecnica.dc.html" },
  { id: "ferramenta-migracao", route: "/ferramentas/migracao-para-nuvem", file: "Ferramenta Migracao para nuvem.dc.html" },
  { id: "newsletter", route: "/newsletter", file: "Newsletter.dc.html" },
  { id: "newsletter-arquivo", route: "/newsletter/edicoes", file: "Newsletter Arquivo.dc.html" },
  { id: "newsletter-previa", route: `/newsletter/edicoes/${sortedEdicoes()[0].slug}`, file: "Newsletter Previa.dc.html" },
  { id: "404", route: "/rota-inexistente-qa", file: "404.dc.html" },
];

function serveExports(): Promise<{ server: Server; origin: string }> {
  const server = createServer((request, response) => {
    let path: string;
    try { path = decodeURIComponent((request.url ?? "/").split("?")[0]); } catch { response.writeHead(400).end(); return; }
    const file = join(EXPORTS_ROOT, path);
    const outside = relative(EXPORTS_ROOT, file);
    if (outside.startsWith("..") || isAbsolute(outside)) { response.writeHead(403).end(); return; }
    try {
      if (!statSync(file).isFile()) throw new Error("not a file");
      response.writeHead(200, { "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" }).end(readFileSync(file));
    } catch { response.writeHead(404).end(); }
  });
  return new Promise((done, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (typeof address !== "object" || !address) { reject(new Error("export server has no address")); return; }
      done({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function shoot(page: Page, file: string) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(1200);
  const metrics = await page.evaluate(() => ({
    documentHeight: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth > innerWidth,
    canvases: document.querySelectorAll("canvas").length,
    h1: document.querySelector("h1")?.textContent?.trim() ?? null,
    fontsLoaded: [...document.fonts].filter(font => font.status === "loaded").map(font => `${font.family} ${font.weight}`),
  }));
  await page.screenshot({ path: join(OUT, file), type: "jpeg", quality: 60, fullPage: true });
  return metrics;
}

test("capture native routes and approved exports", async ({ page, browser }, info) => {
  test.setTimeout(480000);
  mkdirSync(OUT, { recursive: true });
  const viewport = info.project.name.replace("chromium-", "");
  const size = page.viewportSize();
  const report: Record<string, unknown> = { project: info.project.name, viewport: `${size?.width}x${size?.height}`, reducedMotion: "reduce", deviceScaleFactor: 1, pairs: {} };
  const pairs = report.pairs as Record<string, unknown>;
  const { server, origin } = await serveExports();
  const context = await browser.newContext({ viewport: size ?? undefined, deviceScaleFactor: 1, reducedMotion: "reduce", isMobile: info.project.use.isMobile, hasTouch: info.project.use.hasTouch });
  try {
    const base = await context.newPage();
    for (const pair of PAIRS) {
      const errors: string[] = [];
      const onError = (error: Error) => errors.push(error.message);
      page.on("pageerror", onError);
      await page.goto(pair.route);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      const native = await shoot(page, `${viewport}-${pair.id}-native.jpg`);
      page.off("pageerror", onError);

      const baseErrors: string[] = [];
      const failed: string[] = [];
      const onBaseError = (error: Error) => baseErrors.push(error.message);
      const onFailed = (req: { url(): string }) => failed.push(req.url());
      base.on("pageerror", onBaseError); base.on("requestfailed", onFailed);
      await base.goto(`${origin}/${encodeURIComponent(pair.file)}`, { waitUntil: "networkidle", timeout: 60000 });
      const baseline = await shoot(base, `${viewport}-${pair.id}-export.jpg`);
      base.off("pageerror", onBaseError); base.off("requestfailed", onFailed);
      pairs[pair.id] = { route: pair.route, export: pair.file, native: { ...native, pageErrors: errors }, exportPage: { ...baseline, pageErrors: baseErrors, failedRequests: failed } };
    }
  } finally {
    await context.close();
    await new Promise(done => server.close(done));
  }
  writeFileSync(join(OUT, `${viewport}-metrics.json`), JSON.stringify(report, null, 2));
});
