import { createServer, type Server } from "node:http";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Evidence capture, not a regression check: runs only with HOME_QA_CAPTURE=1.
 * Native Home vs the immutable baseline (served read-only), same viewport, reduced motion, fonts loaded.
 */
test.skip(process.env.HOME_QA_CAPTURE !== "1", "set HOME_QA_CAPTURE=1 to capture Home evidence");
test.use({ deviceScaleFactor: 1, reducedMotion: "reduce" });

const SECTIONS = ["hero", "pilares", "servicos", "como", "lidera", "ferramentas", "newsletter", "cta", "ctasym"];
const OUT = resolve(process.cwd(), "../references/audits/home-qa");
const BASELINE_ROOT = resolve(process.cwd(), "../references/claude-design");
const TYPES: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".json": "application/json" };

function serveBaseline(): Promise<{ server: Server; origin: string }> {
  const server = createServer((request, response) => {
    const path = normalize(decodeURIComponent((request.url ?? "/").split("?")[0]));
    const file = join(BASELINE_ROOT, path);
    if (!file.startsWith(BASELINE_ROOT)) { response.writeHead(403).end(); return; }
    try {
      if (!statSync(file).isFile()) throw new Error("not a file");
      response.writeHead(200, { "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" }).end(readFileSync(file));
    } catch { response.writeHead(404).end(); }
  });
  return new Promise(resolveServer => server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    resolveServer({ server, origin: `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}` });
  }));
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(1200);
}

async function capture(page: Page, source: "native" | "baseline", viewport: string) {
  const metrics = await page.evaluate(() => {
    const top = (el: Element) => Math.round(el.getBoundingClientRect().top + scrollY);
    return {
      documentHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > innerWidth,
      canvases: document.querySelectorAll("canvas").length,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      fontsLoaded: [...document.fonts].filter(font => font.status === "loaded").map(font => `${font.family} ${font.weight}`),
      sections: Object.fromEntries([...document.querySelectorAll("[data-sec]")].map(el => [el.getAttribute("data-sec"), { top: top(el), height: Math.round(el.getBoundingClientRect().height) }])),
    };
  });
  const files: string[] = [];
  const vh = (await page.viewportSize())?.height ?? 1000;
  for (const [index, name] of SECTIONS.entries()) {
    const geometry = metrics.sections[name];
    if (!geometry) continue;
    const positions = [Math.max(0, geometry.top)];
    if (geometry.height > vh * 1.5) positions.push(Math.max(0, geometry.top + Math.round(vh * 0.9)));
    for (const [step, y] of positions.entries()) {
      await page.evaluate(value => scrollTo(0, value), y);
      await page.waitForTimeout(450);
      const file = `${viewport}-${source}-${String(index + 1).padStart(2, "0")}-${name}-${step + 1}.jpg`;
      await page.screenshot({ path: join(OUT, file), type: "jpeg", quality: 72 });
      files.push(file);
    }
  }
  return { metrics, files };
}

test("capture native and baseline Home sections", async ({ page, browser }, info) => {
  test.setTimeout(240000);
  mkdirSync(OUT, { recursive: true });
  const viewport = info.project.name.replace("chromium-", "");
  const size = await page.viewportSize();
  const report: Record<string, unknown> = { viewport: `${size?.width}x${size?.height}`, project: info.project.name, reducedMotion: "reduce", deviceScaleFactor: 1 };
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("/");
  await expect(page.locator('[data-sec="pilares"] [data-graphic-status="ready"]').first()).toBeAttached();
  await settle(page);
  report.native = { ...(await capture(page, "native", viewport)), pageErrors: [...errors] };

  const { server, origin } = await serveBaseline();
  const context = await browser.newContext({ viewport: size ?? undefined, deviceScaleFactor: 1, reducedMotion: "reduce", isMobile: info.project.use.isMobile, hasTouch: info.project.use.hasTouch });
  try {
    const base = await context.newPage();
    const baseErrors: string[] = [];
    base.on("pageerror", error => baseErrors.push(error.message));
    await base.goto(`${origin}/Home.baseline.dc.html`, { waitUntil: "networkidle", timeout: 60000 });
    await settle(base);
    report.baseline = { ...(await capture(base, "baseline", viewport)), pageErrors: baseErrors };
  } finally { await context.close(); await new Promise(done => server.close(done)); }

  writeFileSync(join(OUT, `${viewport}-metrics.json`), JSON.stringify(report, null, 2));
});
