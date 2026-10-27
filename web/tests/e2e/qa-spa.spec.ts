import { expect, test, type Page } from "@playwright/test";
import { collectIssues, drawsDuring, findClipped, instrument, ROUTES } from "./qa-shared";

/** Chromium-only QA (production build): SPA pause persistence, GPU disposal, zoom/reflow, keyboard, no-JS. */

const pause = (page: Page) => page.getByRole("button", { name: "Pausar animações" });
const resume = (page: Page) => page.getByRole("button", { name: "Retomar animações" });
const toPrivacy = (page: Page) => page.getByRole("contentinfo").getByRole("link", { name: "Privacidade" }).click();

test.describe("SPA graphics lifecycle", () => {
  test("global pause survives client-side navigation both ways and resume restores drawing", async ({ page }) => {
    const issues = collectIssues(page);
    await instrument(page);
    await page.goto("/");
    await page.evaluate(() => { (window as unknown as { __spa: number }).__spa = 1; });
    await expect(page.locator("canvas").first()).toBeAttached();
    // control: the instrumentation must see drawing before pause, otherwise "0 draws" after pause proves nothing
    await expect.poll(() => drawsDuring(page, 500), { timeout: 10000 }).toBeGreaterThan(0);
    await pause(page).click();
    await expect(resume(page)).toHaveAttribute("aria-pressed", "true");

    await toPrivacy(page);
    await expect(page).toHaveURL(/\/privacidade$/);
    expect(await page.evaluate(() => (window as unknown as { __spa?: number }).__spa)).toBe(1);
    await expect(resume(page)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-graphic="frame"]')).toHaveAttribute("data-graphic-status", "ready");
    expect(await drawsDuring(page, 700)).toBe(0);

    await page.getByRole("link", { name: "Voltar à Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(() => (window as unknown as { __spa?: number }).__spa)).toBe(1);
    await expect(resume(page)).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(400);
    expect(await drawsDuring(page, 700)).toBe(0);

    await resume(page).click();
    await expect(pause(page)).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(300);
    expect(await drawsDuring(page, 700)).toBeGreaterThan(10);
    expect(issues).toEqual([]);
  });

  test("leaving the Home by SPA discards every WebGL context and pillar canvas; returning creates a fresh one", async ({ page }) => {
    const issues = collectIssues(page);
    await instrument(page);
    await page.goto("/");
    await page.locator('[data-sec="pilares"]').evaluate(el => el.scrollIntoView({ block: "center" }));
    await expect(page.locator('[data-sec="pilares"] [data-graphic-status="ready"]').first()).toBeVisible();
    const lostState = () => page.evaluate(() => (window as unknown as { __gl: WebGLRenderingContext[] }).__gl.map(gl => gl.isContextLost()));
    const first = await lostState();
    expect(first.length).toBeGreaterThan(0);
    expect(first).toContain(false);

    await toPrivacy(page);
    await expect(page).toHaveURL(/\/privacidade$/);
    await expect.poll(async () => (await lostState()).every(Boolean)).toBe(true);
    await expect(page.locator("[data-graphic]:not([data-graphic=frame]):not([data-graphic=symbol])")).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.locator('[data-sec="pilares"]').evaluate(el => el.scrollIntoView({ block: "center" }));
    await expect(page.locator('[data-sec="pilares"] [data-graphic-status="ready"]').first()).toBeVisible();
    const after = await lostState();
    expect(after.length).toBeGreaterThan(first.length);
    expect(after.filter(lost => !lost).length).toBe(1);
    expect(issues).toEqual([]);
  });
});

const VIEWPORTS = [
  { name: "640x512 CSS px viewport (geometric equivalent of 200% zoom; not real browser zoom)", width: 640, height: 512 },
  { name: "320x256 CSS px viewport (geometric equivalent of 400% zoom; not real browser zoom)", width: 320, height: 256 },
  { name: "320x700 CSS px phone viewport", width: 320, height: 700 },
] as const;

for (const viewport of VIEWPORTS) {
  test(`reflow ${viewport.name}: no horizontal overflow or clipped main/footer content, without runtime errors`, async ({ page }) => {
    const issues = collectIssues(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const overflowing: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth }));
      if (width.scroll > width.inner) overflowing.push(`${route.path} ${width.scroll}>${width.inner}`);
      for (const clipped of await findClipped(page)) overflowing.push(`${route.path} ${clipped}`);
    }
    expect(issues).toEqual([]);
    const notFound = await page.goto("/rota-inexistente-qa");
    expect(notFound?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) overflowing.push("/rota-inexistente-qa");
    for (const clipped of await findClipped(page)) overflowing.push(`/rota-inexistente-qa ${clipped}`);
    expect(overflowing).toEqual([]);
  });
}

test("keyboard: every route has a finite tab order, visible focus indicators and no hidden or trapped stops", async ({ page }) => {
  test.setTimeout(240000);
  const problems: string[] = [];
  for (const route of [...ROUTES, { path: "/rota-inexistente-qa" }]) {
    await page.goto(route.path);
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
    const stops: string[] = [];
    let wrapped = false;
    for (let step = 0; step < 250; step++) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body || el === document.documentElement) return { wrap: true as const };
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const paint = () => { const s = getComputedStyle(el); return `${s.outlineStyle}|${s.outlineWidth}|${s.outlineColor}|${s.outlineOffset}|${s.boxShadow}`; };
        // a focus indicator is a paint change caused by focus (outline/box-shadow), not a decoration that is always there
        const focused = paint();
        el.blur();
        const unfocused = paint();
        el.focus();
        const ring = focused !== unfocused && document.activeElement === el;
        const label = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} "${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40)}"`;
        return { wrap: false as const, label, hidden: rect.width === 0 || rect.height === 0 || style.visibility === "hidden", ring };
      });
      if (stop.wrap) { wrapped = true; break; }
      stops.push(stop.label);
      if (stop.hidden) problems.push(`${route.path}: focus on hidden element ${stop.label}`);
      if (!stop.ring) problems.push(`${route.path}: focus does not change outline/box-shadow on ${stop.label}`);
    }
    if (!wrapped) problems.push(`${route.path}: tab order did not leave the page within 250 stops`);
    if (stops.length < 3) problems.push(`${route.path}: only ${stops.length} tab stops`);
  }
  expect(problems).toEqual([]);
});

test("without JavaScript every route keeps its heading and essential content", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const route of [...ROUTES, { path: "/rota-inexistente-qa" }]) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      const text = await page.locator("main").innerText();
      expect(text.length, route.path).toBeGreaterThan(100);
      expect(await page.locator("a[href]:visible").count(), route.path).toBeGreaterThan(2);
    }
  } finally { await context.close(); }
});
