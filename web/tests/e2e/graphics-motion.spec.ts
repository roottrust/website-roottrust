import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Instrumentation lives only in the test (addInitScript): it counts 2D draw calls per canvas and,
 * optionally, hides or captures WebGL. No production debug API is involved.
 */
type Probe = { noWebgl?: boolean };
async function instrument(page: Page, probe: Probe = {}) {
  await page.addInitScript((options: Probe) => {
    const draws = new WeakMap<HTMLCanvasElement, number>();
    const w = window as unknown as { __draws: (el: Element) => number; __gl: WebGLRenderingContext[] };
    for (const name of ["clearRect", "drawImage", "fillRect"] as const) {
      const original = CanvasRenderingContext2D.prototype[name] as (...args: unknown[]) => void;
      Object.defineProperty(CanvasRenderingContext2D.prototype, name, {
        configurable: true, writable: true,
        value(this: CanvasRenderingContext2D, ...args: unknown[]) {
          draws.set(this.canvas, (draws.get(this.canvas) ?? 0) + 1);
          return original.apply(this, args);
        },
      });
    }
    w.__draws = el => draws.get(el as HTMLCanvasElement) ?? 0;
    w.__gl = [];
    const getContext = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, type: string, ...rest: unknown[]) => unknown;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true, writable: true,
      value(this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/.test(type)) {
          if (options.noWebgl) return null;
          const gl = getContext.call(this, type, ...rest) as WebGLRenderingContext | null;
          if (gl) w.__gl.push(gl);
          return gl;
        }
        return getContext.call(this, type, ...rest);
      },
    });
  }, probe);
}

const visibleCanvases = (page: Page) => page.locator("canvas:visible");

/** Draw calls per canvas inside one window; only canvases currently intersecting the viewport. */
async function drawsDuring(page: Page, ms: number) {
  return page.evaluate(async duration => {
    const w = window as unknown as { __draws: (el: Element) => number };
    const canvases = [...document.querySelectorAll("canvas")];
    const before = canvases.map(w.__draws);
    await new Promise(resolve => setTimeout(resolve, duration));
    return canvases.map((canvas, index) => {
      const r = canvas.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      return { kind: canvas.closest("[data-graphic]")?.getAttribute("data-graphic") ?? (canvas.className.includes("frame") ? "frame" : "home"), status: canvas.closest("[data-graphic]")?.getAttribute("data-graphic-status") ?? null, onScreen, delta: w.__draws(canvas) - before[index] };
    });
  }, ms);
}
const total = (rows: { delta: number }[]) => rows.reduce((sum, row) => sum + row.delta, 0);
const onScreen = <T extends { onScreen: boolean }>(rows: T[]) => rows.filter(row => row.onScreen);

/** On-screen pillar canvases with at least one non-transparent pixel (the Home ASCII canvas is empty outside its bands). */
async function paintedState(page: Page) {
  return page.evaluate(() => [...document.querySelectorAll<HTMLCanvasElement>("canvas")].filter(canvas => {
    const r = canvas.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && canvas.closest("[data-graphic]");
  }).map(canvas => {
    const context = canvas.getContext("2d");
    const data = context?.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = false;
    for (let i = 3; data && i < data.length; i += 4 * 97) if (data[i] > 0) { painted = true; break; }
    return { kind: canvas.closest("[data-graphic]")?.getAttribute("data-graphic") ?? "home", painted };
  }));
}

const PILLARS = "div[data-graphic]:not([data-graphic=symbol])";
const pillarArts = (page: Page) => page.locator(PILLARS);

/** Pillars whose box intersects the viewport must all be "ready" (first drawImage done); at least one must exist. */
async function expectViewportPillarsReady(page: Page) {
  await expect.poll(() => page.evaluate(selector => {
    const visible = [...document.querySelectorAll(selector)].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    });
    return visible.length > 0 && visible.every(el => el.getAttribute("data-graphic-status") === "ready");
  }, PILLARS)).toBe(true);
}

/**
 * Scrolls every rendered pillar (display:none ones never mount) into view and waits for its terminal status.
 * "ready" additionally requires the fallback gone and a painted canvas, i.e. a real first frame.
 */
async function visitPillars(page: Page, status: "ready" | "failed", scope: Locator = pillarArts(page)) {
  let visited = 0;
  for (const art of await scope.all()) {
    if (!(await art.isVisible())) continue;
    await art.evaluate(el => el.scrollIntoView({ block: "center" }));
    await expect(art).toHaveAttribute("data-graphic-status", status);
    if (status === "ready") {
      await expect(art.locator('[data-graphic-fallback="true"]')).toHaveCount(0);
      const painted = await art.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
        const data = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; data && i < data.length; i += 4 * 97) if (data[i] > 0) return true;
        return false;
      });
      expect(painted).toBe(true);
    }
    visited++;
  }
  expect(visited).toBeGreaterThan(0);
}

const scrollToPillars = (page: Page) => page.locator('[data-sec="pilares"]').evaluate(el => el.scrollIntoView({ block: "center" }));

async function gotoWithPillars(page: Page) {
  await page.goto("/");
  await scrollToPillars(page);
  await expectViewportPillarsReady(page);
  await page.mouse.move(5, 5);
}

/** Mounts and paints every rendered pillar, then returns to the pillars section so suspension is measured on real, live instances. */
async function gotoWithAllPillars(page: Page) {
  await gotoWithPillars(page);
  await visitPillars(page, "ready");
  await scrollToPillars(page);
  await expectViewportPillarsReady(page);
}

test.describe("graphics motion contract (production build, Chromium)", () => {
  test.beforeEach(async ({ page }) => { await instrument(page); });

  test("reduced motion at load still paints a static frame and never animates", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoWithPillars(page);
    await page.waitForTimeout(500);
    expect(total(await drawsDuring(page, 700))).toBe(0);
    const state = await paintedState(page);
    expect(state.length).toBeGreaterThan(0);
    expect(state.filter(row => !row.painted)).toEqual([]);
  });

  test("animates by default and stops drawing when reduced motion turns on after load, then resumes", async ({ page }) => {
    await gotoWithAllPillars(page);
    const active = await drawsDuring(page, 700);
    expect(onScreen(active).length).toBeGreaterThan(0);
    expect(total(onScreen(active))).toBeGreaterThan(10);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(400);
    const reduced = await drawsDuring(page, 700);
    expect(total(reduced)).toBe(0);
    await expect(page.locator('[data-graphic-status="failed"]')).toHaveCount(0);
    await expect(pillarArts(page).locator('[data-graphic-fallback="true"]:visible')).toHaveCount(0);
    const frozen = await paintedState(page);
    expect(frozen.length).toBeGreaterThan(0);
    expect(frozen.filter(row => !row.painted)).toEqual([]);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForTimeout(300);
    expect(total(onScreen(await drawsDuring(page, 700)))).toBeGreaterThan(10);
  });

  test("global pause freezes drawing and resume restores it", async ({ page }) => {
    await gotoWithAllPillars(page);
    expect(total(onScreen(await drawsDuring(page, 500)))).toBeGreaterThan(10);
    await page.getByRole("button", { name: "Pausar animações" }).click();
    await page.waitForTimeout(400);
    expect(total(await drawsDuring(page, 700))).toBe(0);
    await expect(page.getByRole("button", { name: "Retomar animações" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Retomar animações" }).click();
    await page.waitForTimeout(300);
    expect(total(onScreen(await drawsDuring(page, 700)))).toBeGreaterThan(10);
  });

  test("off-screen graphics are suspended and wake up when scrolled into view", async ({ page }) => {
    await page.goto("/");
    const glCount = () => page.evaluate(() => (window as unknown as { __gl: unknown[] }).__gl.length);
    const pillars = page.locator('[data-sec="pilares"] [data-graphic]');
    await expect(pillars.first()).toHaveAttribute("data-graphic-status", "loading");
    await page.waitForTimeout(500);
    const before = await glCount();
    await expect(pillars.first()).toHaveAttribute("data-graphic-status", "loading");
    await page.locator('[data-sec="pilares"]').evaluate(el => el.scrollIntoView({ block: "center" }));
    await expectViewportPillarsReady(page);
    expect(await glCount()).toBeGreaterThan(before);
    await visitPillars(page, "ready");
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
    const top = await drawsDuring(page, 700);
    const pillarsAtTop = top.filter(row => row.kind !== "home" && row.kind !== "frame" && row.status === "ready" && !row.onScreen);
    expect(pillarsAtTop.length).toBeGreaterThan(0);
    expect(total(pillarsAtTop)).toBe(0);
    expect(total(top.filter(row => row.kind === "home"))).toBeGreaterThan(10);

    await page.locator('[data-sec="pilares"]').evaluate(el => { el.scrollIntoView({ block: "start" }); scrollBy(0, 120); });
    await page.waitForTimeout(500);
    const mid = await drawsDuring(page, 700);
    expect(total(mid.filter(row => row.kind !== "home" && row.kind !== "frame" && row.onScreen))).toBeGreaterThan(10);
    expect(total(mid.filter(row => row.kind === "home"))).toBe(0);
  });

  // Simulation of the contract only: document.hidden is overridden. This is NOT a real background tab.
  test("hidden page (simulated visibility) suspends all drawing and resumes on return", async ({ page }) => {
    await gotoWithAllPillars(page);
    expect(total(onScreen(await drawsDuring(page, 500)))).toBeGreaterThan(10);
    const setHidden = (hidden: boolean) => page.evaluate(value => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => value });
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (value ? "hidden" : "visible") });
      document.dispatchEvent(new Event("visibilitychange"));
    }, hidden);
    await setHidden(true);
    await page.waitForTimeout(400);
    expect(total(await drawsDuring(page, 700))).toBe(0);
    await setHidden(false);
    await page.waitForTimeout(300);
    expect(total(onScreen(await drawsDuring(page, 700)))).toBeGreaterThan(10);
  });

  // Real browser tab switch. Headless Chromium usually keeps every page visible; skipped (not passed) in that case.
  test("real background tab suspends drawing", async ({ page, context }) => {
    await gotoWithAllPillars(page);
    expect(total(onScreen(await drawsDuring(page, 500)))).toBeGreaterThan(10);
    const other = await context.newPage();
    await other.goto("about:blank");
    await other.bringToFront();
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => document.visibilityState);
    test.skip(state !== "hidden", `browser did not report a hidden tab (visibilityState=${state}); real background not verifiable here`);
    expect(total(await drawsDuring(page, 700))).toBe(0);
    await page.bringToFront();
    await expect.poll(async () => total(onScreen(await drawsDuring(page, 400)))).toBeGreaterThan(5);
  });
});

test.describe("graphics fallback contract", () => {
  test("WebGL unavailable at load shows the approved fallback and keeps content usable", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await instrument(page, { noWebgl: true });
    await page.goto("/");
    await page.locator('[data-sec="pilares"]').evaluate(el => el.scrollIntoView({ block: "center" }));
    const arts = page.locator('[data-sec="pilares"] [data-graphic]');
    await visitPillars(page, "failed", pillarArts(page));
    for (const art of await arts.all()) {
      await art.evaluate(el => el.scrollIntoView({ block: "center" }));
      await expect(art).toHaveAttribute("data-graphic-status", "failed");
      await expect(art.locator('[data-graphic-fallback="true"]')).toBeVisible();
      await expect(art.locator("canvas")).toBeHidden();
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Confiabilidade com profundidade.");
    await expect(page.getByRole("form", { name: "Solicitar diagnóstico" })).toBeVisible();
    expect(errors).toEqual([]);
    await page.getByRole("button", { name: "Pausar animações" }).click();
    await page.getByRole("button", { name: "Retomar animações" }).click();
    await expect(arts.first()).toHaveAttribute("data-graphic-status", "failed");
    expect(errors).toEqual([]);
  });

  // Scope: pillars already mounted (ready) when the shared context is lost. Pillars never mounted before the loss
  // may legitimately acquire a fresh renderer later, so they are not asserted here.
  test("real WebGL context loss fails every already-mounted pillar and never resurrects them", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await instrument(page);
    await gotoWithAllPillars(page);
    const statuses = () => pillarArts(page).evaluateAll(list => list.map(el => el.getAttribute("data-graphic-status")));
    const mounted = (await statuses()).flatMap((status, index) => (status === "ready" ? [index] : []));
    expect(mounted.length).toBeGreaterThan(0);
    const lost = await page.evaluate(() => {
      const contexts = (window as unknown as { __gl: WebGLRenderingContext[] }).__gl;
      const extension = contexts.map(gl => gl.getExtension("WEBGL_lose_context")).find(Boolean);
      extension?.loseContext();
      return { contexts: contexts.length, hadExtension: Boolean(extension) };
    });
    expect(lost.hadExtension).toBe(true);
    const mountedAllFailed = async () => { const now = await statuses(); return mounted.every(index => now[index] === "failed"); };
    await expect.poll(mountedAllFailed).toBe(true);
    for (const index of mounted) {
      const art = pillarArts(page).nth(index);
      await art.evaluate(el => el.scrollIntoView({ block: "center" }));
      await expect(art.locator('[data-graphic-fallback="true"]')).toBeVisible();
    }
    const afterLoss = await drawsDuring(page, 600);
    expect(total(afterLoss.filter(row => row.kind !== "home" && row.kind !== "frame" && row.kind !== "symbol"))).toBe(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.getByRole("button", { name: "Pausar animações" }).click();
    await page.getByRole("button", { name: "Retomar animações" }).click();
    await page.waitForTimeout(400);
    expect(await mountedAllFailed()).toBe(true);
    expect(errors).toEqual([]);
  });

  // 2D canvas contextlost is dispatched by the test: simulation of the handler contract, not a real GPU event.
  test("canvas contextlost on the Home canvas shows the approved fallback (simulated event)", async ({ page }) => {
    await instrument(page);
    await page.goto("/");
    await expect(page.locator('main > img[data-graphic-fallback="true"]')).toHaveCount(0, { timeout: 10000 });
    await page.evaluate(() => document.querySelector<HTMLCanvasElement>("main > canvas")?.dispatchEvent(new Event("contextlost")));
    await expect(page.locator('main > img[data-graphic-fallback="true"]')).toBeVisible();
    await expect(visibleCanvases(page).first()).toBeAttached();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

