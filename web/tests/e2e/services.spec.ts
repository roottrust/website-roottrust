import { expect, test, type Page } from "@playwright/test";

const routes = [
  { path: "/servicos/ciberseguranca", h1: "Pentest e cibersegurança", text: ["Reteste após as correções conforme escopo e contrato.", "Gestão de vulnerabilidades", "Red Team", "Apoio a normas e compliance", "A conversa gratuita não inclui"] },
  { path: "/servicos/infraestrutura-em-nuvem", h1: "Continuidade e custos", text: ["As entregas dependem do escopo e do contrato.", "Não há percentual de economia prometido."] },
  { path: "/servicos/desenvolvimento-de-software", h1: "Software sob medida", text: ["As entregas dependem do escopo e do contrato.", "Integração", "Automação"] },
] as const;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => { if (response.status() === 404) errors.push(response.url()); });
  return errors;
}

for (const route of routes) {
  test(`${route.path}: SSR content, 6 sections, FAQ and contract text`, async ({ page, request }) => {
    const errors = collectErrors(page);
    const html = await (await request.get(route.path)).text();
    expect(html).toContain(route.h1);
    for (const text of route.text) expect(html).toContain(text.replace(/&/g, "&amp;"));

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(route.h1);
    await expect(page.locator("main > section, main > div > section")).toHaveCount(6);
    await expect(page.locator("main").getByRole("link", { name: "Solicitar diagnóstico" })).toHaveAttribute("href", "#contato");
    for (const text of route.text) await expect(page.locator("main")).toContainText(text);

    const first = page.locator("details").first();
    await first.locator("summary").focus();
    await expect(first).not.toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
    await page.keyboard.press("Space");
    await expect(first).not.toHaveAttribute("open", "");

    await page.locator("main").getByRole("link", { name: "Solicitar diagnóstico" }).click();
    await expect(page).toHaveURL(/#contato$/);
    const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
    await form.getByRole("button", { name: "Solicitar diagnóstico" }).click();
    await expect(form.getByLabel("Nome", { exact: true })).toBeFocused();
    await expect(form.getByLabel("Nome", { exact: true })).toHaveAttribute("aria-invalid", "true");
    expect(errors).toEqual([]);
  });

  test(`${route.path}: no horizontal overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(route.path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("default mode never claims successful receipt", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/servicos/ciberseguranca");
  const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
  await form.getByLabel("Nome", { exact: true }).fill("Pessoa de teste");
  await form.getByLabel("Empresa", { exact: true }).fill("Empresa demonstrativa");
  await form.getByLabel("WhatsApp", { exact: true }).fill("11940084692");
  await form.getByRole("button", { name: "Solicitar diagnóstico" }).click();
  await expect(form.getByRole("status")).toHaveText("O envio ainda não está disponível. Nenhum dado foi enviado.");
});

test.describe("service graphics: frame and symbol", () => {
  test("frame and CTA symbol render, with cuts and band marked", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/servicos/infraestrutura-em-nuvem");
    await expect(page.locator("main [data-frame-cut]")).toHaveCount(5);
    await expect(page.locator('[data-band="cta"]')).toHaveCount(1);
    const frame = page.locator('canvas[data-graphic="frame"]');
    await expect(frame).toHaveAttribute("data-graphic-status", "ready");
    const symbol = page.locator('[data-graphic="symbol"]');
    await symbol.scrollIntoViewIfNeeded();
    await expect(symbol).toHaveAttribute("data-graphic-status", "ready");
    const box = await symbol.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(100);
    if ((page.viewportSize()?.width ?? 0) >= 960) {
      await page.locator("#situacoes").scrollIntoViewIfNeeded();
      await expect.poll(() => frame.evaluate((c: HTMLCanvasElement) => {
        const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
        return false;
      })).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test("Canvas 2D unavailable falls back without errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        return type === "2d" ? null : (original as (...args: unknown[]) => RenderingContext | null).call(this, type, ...rest);
      } as typeof original;
    });
    await page.goto("/servicos/ciberseguranca");
    await expect(page.locator('canvas[data-graphic="frame"]')).toHaveAttribute("data-graphic-status", "failed");
    await expect(page.locator('canvas[data-graphic="frame"]')).toBeHidden();
    const symbol = page.locator('[data-graphic="symbol"]');
    await symbol.scrollIntoViewIfNeeded();
    await expect(symbol).toHaveAttribute("data-graphic-status", "failed");
    await expect(symbol.locator('[data-graphic-fallback="true"]')).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("form", { name: "Solicitar diagnóstico" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("global pause stops drawing and keeps the frame ready", async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __raf: number };
      w.__raf = 0;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = cb => { w.__raf++; return raf(cb); };
    });
    await page.goto("/servicos/desenvolvimento-de-software");
    await expect(page.locator('canvas[data-graphic="frame"]')).toHaveAttribute("data-graphic-status", "ready");
    await page.getByRole("button", { name: "Pausar animações" }).click();
    await page.waitForTimeout(400);
    const before = await page.evaluate(() => (window as unknown as { __raf: number }).__raf);
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => (window as unknown as { __raf: number }).__raf);
    expect(after - before).toBeLessThanOrEqual(1);
    await expect(page.locator('canvas[data-graphic="frame"]')).toHaveAttribute("data-graphic-status", "ready");
    expect(errors).toEqual([]);
  });
});
