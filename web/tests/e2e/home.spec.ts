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
    await expect(page.locator('[aria-live="polite"][aria-atomic="true"]')).toContainText("Etapa 05 de 5: Evolução");
  } else {
    const services = page.locator('[data-sec="servicos"]');
    for (const title of ["Cibersegurança", "Infraestrutura em nuvem", "Software"]) {
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
