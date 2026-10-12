import { expect, test, type Page } from "@playwright/test";
import { EDICOES_PUBLICAS } from "../../src/features/newsletter/catalog";

const INNER = 1200;

async function width(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`sem caixa para ${selector}`);
  return Math.round(box.width);
}

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("arquivo: abertura, destaque e lista usam toda a largura útil", async ({ page }) => {
    await page.goto("/newsletter/edicoes");
    const heroText = page.locator("section[aria-labelledby='titulo'] > div > div").first();
    expect(Math.round((await heroText.boundingBox())!.width)).toBe(INNER);
    expect(await width(page, "#destaque >> xpath=ancestor::section[1]")).toBe(INNER);
    expect(await width(page, "ol > li article")).toBe(INNER);
    const lead = Math.round((await page.locator("section[aria-labelledby='titulo'] p").first().boundingBox())!.width);
    const h1 = Math.round((await page.locator("#titulo").boundingBox())!.width);
    expect(h1 + lead).toBeGreaterThan(INNER / 2 + 400);
  });

  for (const edicao of EDICOES_PUBLICAS) {
    test(`prévia ${edicao.slug}: artigo, título e card em toda a largura, parágrafo legível`, async ({ page }) => {
      await page.goto(`/newsletter/edicoes/${edicao.slug}`);
      expect(await width(page, "article[aria-labelledby='titulo']")).toBe(INNER);
      expect(await width(page, "#titulo")).toBe(INNER);
      expect(await width(page, "#receba >> xpath=ancestor::div[1]")).toBe(INNER);
      const paragraph = await width(page, "article[aria-labelledby='titulo'] > p:last-child");
      expect(paragraph).toBeLessThan(INNER);
      expect(paragraph).toBeLessThanOrEqual(820);
    });
  }

  test("landing /newsletter mantém o bloco de abertura limitado", async ({ page }) => {
    await page.goto("/newsletter");
    expect(await width(page, "section[aria-labelledby='titulo'] p")).toBeLessThanOrEqual(560);
  });
});

for (const vw of [320, 390]) {
  test(`arquivo e prévias sem overflow em ${vw}px`, async ({ page }) => {
    await page.setViewportSize({ width: vw, height: 844 });
    for (const path of ["/newsletter/edicoes", ...EDICOES_PUBLICAS.map((e) => `/newsletter/edicoes/${e.slug}`)]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
}
