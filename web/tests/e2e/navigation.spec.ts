import { expect, test, type Page } from "@playwright/test";

const ANCHORS = [
  { label: "Serviços", id: "servicos" },
  { label: "Ferramentas", id: "ferramentas" },
  { label: "Solicitar diagnóstico", id: "contato" },
] as const;

type Probe = { samples: number[]; spa: boolean };
const probe = (page: Page) => page.evaluate(() => (window as unknown as { __probe: Probe }).__probe);

/** Records scrollY every frame; marker `spa` survives client navigation and is lost on full reloads. */
async function startProbe(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __probe: Probe };
    w.__probe = { samples: [], spa: true };
    const tick = () => { w.__probe.samples.push(scrollY); requestAnimationFrame(tick); };
    tick();
  });
}

async function settled(page: Page) {
  await page.waitForFunction(() => {
    const samples = (window as unknown as { __probe: Probe }).__probe.samples;
    const last = samples.at(-1) ?? 0;
    return last > 0 && samples.length > 30 && samples.slice(-20).every(value => value === last);
  }, undefined, { timeout: 8000 });
}

async function clickHeader(page: Page, name: string) {
  const toggle = page.getByRole("button", { name: "Abrir menu" });
  if (await toggle.isVisible()) await toggle.click();
  await page.locator("header").getByRole("link", { name, exact: true }).click();
}

async function expectAtAnchor(page: Page, id: string) {
  const { top, atEnd } = await page.evaluate(anchor => ({
    top: document.getElementById(anchor)!.getBoundingClientRect().top,
    atEnd: scrollY >= document.documentElement.scrollHeight - innerHeight - 1,
  }), id);
  expect(top).toBeGreaterThanOrEqual(76 - 2);
  if (!atEnd) expect(top).toBeLessThanOrEqual(96 + 3);
}

function intermediate(samples: number[]) {
  const final = samples.at(-1) ?? 0;
  return new Set(samples.filter(value => value > 2 && value < final - 2)).size;
}

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test("header links: Newsletter points to /newsletter, anchors stay real hrefs (SSR, no JS)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('href="/newsletter"');
  for (const { id } of ANCHORS) expect(html).toContain(`href="/#${id}"`);
  expect(html).not.toContain('href="/#newsletter"');
});

for (const origin of ["/", "/ferramentas/rosi"]) {
  test(`header Newsletter opens /newsletter from ${origin}`, async ({ page }) => {
    await page.goto(origin);
    await clickHeader(page, "Newsletter");
    await expect(page).toHaveURL(/\/newsletter$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

for (const { label, id } of ANCHORS) {
  test(`${label}: smooth scroll on Home shows intermediate positions and lands below the header`, async ({ page }) => {
    await openHome(page);
    await startProbe(page);
    await clickHeader(page, label);
    await settled(page);
    expect(intermediate((await probe(page)).samples)).toBeGreaterThanOrEqual(3);
    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await expectAtAnchor(page, id);
  });

  test(`${label}: from an internal page scrolls through the Home without a reload`, async ({ page }) => {
    await page.goto("/ferramentas/rosi");
    await expect(page.locator("main")).toBeVisible();
    await startProbe(page);
    await clickHeader(page, label);
    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await settled(page);
    const { samples, spa } = await probe(page);
    expect(spa).toBe(true);
    expect(intermediate(samples)).toBeGreaterThanOrEqual(3);
    await expectAtAnchor(page, id);
  });
}

test("reduced motion: jumps to the destination without intermediate positions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openHome(page);
  await startProbe(page);
  await clickHeader(page, "Ferramentas");
  await settled(page);
  expect(intermediate((await probe(page)).samples)).toBe(0);
  await expectAtAnchor(page, "ferramentas");
});

test("global pause: jumps to the destination, also from an internal page", async ({ page }) => {
  await openHome(page);
  await page.getByRole("button", { name: "Pausar animações" }).click();
  await startProbe(page);
  await clickHeader(page, "Serviços");
  await settled(page);
  expect(intermediate((await probe(page)).samples)).toBe(0);
  await expectAtAnchor(page, "servicos");

  await page.goto("/ferramentas/rosi");
  await page.getByRole("button", { name: "Pausar animações" }).click();
  await startProbe(page);
  await clickHeader(page, "Ferramentas");
  await settled(page);
  expect(intermediate((await probe(page)).samples)).toBe(0);
  await expectAtAnchor(page, "ferramentas");
});

test("modifier click keeps the browser default and does not scroll", async ({ page, context }) => {
  await openHome(page);
  await page.evaluate(() => {
    (window as unknown as { __prevented: boolean[] }).__prevented = [];
    document.addEventListener("click", event => (window as unknown as { __prevented: boolean[] }).__prevented.push(event.defaultPrevented));
  });
  const link = page.locator("header").getByRole("link", { name: "Serviços", exact: true });
  test.skip(!(await link.isVisible()), "desktop navigation only");
  await link.click({ modifiers: ["ControlOrMeta"] });
  expect(await page.evaluate(() => (window as unknown as { __prevented: boolean[] }).__prevented)).toEqual([false]);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  for (const extra of context.pages()) if (extra !== page) await extra.close();
});

test("mobile menu closes after choosing a destination", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-mobile", "mobile menu only");
  await openHome(page);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("navigation", { name: "Navegação móvel" }).getByRole("link", { name: "Ferramentas" }).click();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("navigation", { name: "Navegação móvel" })).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.getElementById("ferramentas")!.getBoundingClientRect().top)).toBeLessThanOrEqual(99);
});

test("repeated clicks and history: lands on the destination, back/forward restore the hash", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await openHome(page);
  await startProbe(page);
  await clickHeader(page, "Serviços");
  await clickHeader(page, "Serviços");
  await settled(page);
  await expectAtAnchor(page, "servicos");

  await clickHeader(page, "Newsletter");
  await expect(page).toHaveURL(/\/newsletter$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/#servicos$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/newsletter$/);
  expect(errors).toEqual([]);
});
