import { expect, test } from "@playwright/test";

test("Home preserves sections, responsive services and keyboard selectors", async ({ page }) => {
  const missing: string[] = [];
  page.on("response", response => { if (response.status() === 404) missing.push(response.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const section of ["hero", "pilares", "servicos", "como", "lidera", "ferramentas", "newsletter", "cta", "ctasym"]) {
    await expect(page.locator(`[data-sec="${section}"]`)).toHaveCount(1);
  }
  const tabs = page.getByRole("tablist", { name: "Serviços" });
  if (await tabs.isVisible()) {
    const first = page.getByRole("tab", { name: /01 Cibersegurança/ });
    await first.focus();
    await first.press("End");
    await expect(page.getByRole("tab", { name: /03 Software/ })).toBeFocused();
    await expect(page.getByRole("tabpanel")).toContainText("Desenvolvemos e evoluímos sistemas sob medida");
    await page.getByRole("button", { name: /05 Evolução/ }).click();
    await expect(page.locator('[aria-live="polite"][aria-atomic="true"]').filter({ hasText: /^Etapa \d+ de 5:/ })).toContainText("Etapa 05 de 5: Evolução");
  } else {
    const services = page.locator('[data-sec="servicos"]');
    for (const title of ["Cibersegurança", "Infraestrutura", "Software"]) {
      await expect(services.getByRole("link", { name: `Conhecer ${title}`, exact: true })).toBeVisible();
    }
    await expect(page.locator('[data-sec="como"] ol:visible > li')).toHaveCount(5);
  }
  await expect(page.getByRole("link", { name: "Ver edições anteriores" })).toHaveAttribute("href", "/newsletter/edicoes");
  await expect(page.getByRole("link", { name: "Privacidade", exact: true })).toHaveAttribute("href", "/privacidade");
  await page.getByRole("link", { name: "Privacidade", exact: true }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(missing).toEqual([]);
});

test("global pause and logo close remain accessible at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  const pause = page.getByRole("button", { name: "Pausar animações" });
  await pause.click();
  await expect(page.getByRole("button", { name: "Retomar animações" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("link", { name: "Root Trust — página inicial", exact: true }).click();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Home Services and Process paragraphs sit below their H2s, left aligned", async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (const [section, text] of [["servicos", "O escopo de cada trabalho é definido em conversa."], ["como", "Um processo claro, colaborativo e adaptado a cada realidade."]] as const) {
      const root = page.locator(`[data-sec="${section}"]`);
      const heading = (await root.locator("h2").first().boundingBox())!;
      const paragraph = (await root.locator("p", { hasText: text }).first().boundingBox())!;
      expect(paragraph.y, `${section} @${width}`).toBeGreaterThanOrEqual(heading.y + heading.height - 1);
      expect(Math.abs(paragraph.x - heading.x), `${section} @${width}`).toBeLessThanOrEqual(1);
      expect(paragraph.width, `${section} @${width}`).toBeLessThanOrEqual(561);
      await expect(root.getByText(text)).toHaveCount(1);
    }
  }
});

test.describe("tools hero: notice and 3D art sizes", () => {
  const cases = [
    { width: 1440, art: [400, 360] },
    { width: 960, art: [400, 360] },
    { width: 959, art: [320, 288] },
    { width: 721, art: [320, 288] },
    { width: 720, art: [240, 218] },
    { width: 320, art: [240, 218] },
  ] as const;
  for (const { width, art } of cases) {
    test(`/ferramentas/rosi @${width}: art ${art[0]}x${art[1]}, notice <= 560 and left aligned`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/ferramentas/rosi");
      const row = page.locator("h1").locator("xpath=../..");
      const artBox = (await row.locator(":scope > div").nth(1).boundingBox())!;
      expect(Math.round(artBox.width), `art width @${width}`).toBe(art[0]);
      expect(Math.round(artBox.height)).toBe(art[1]);
      const text = row.locator(":scope > div").first();
      const badge = (await text.locator(":scope > p").last().boundingBox())!;
      const textBox = (await text.boundingBox())!;
      expect(badge.width).toBeLessThanOrEqual(560.5);
      expect(Math.abs(badge.x - textBox.x)).toBeLessThanOrEqual(1);
      if (width >= 960) expect(artBox.x).toBeGreaterThan(textBox.x + textBox.width - 1);
      else expect(artBox.y).toBeGreaterThanOrEqual(textBox.y + textBox.height - 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
});
