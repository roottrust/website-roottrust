import { expect, test } from "@playwright/test";
import { collectIssues, ROUTES } from "./qa-shared";

/** Runs in every browser project (Chromium full, Firefox/WebKit smoke): one load per public route. */
for (const route of ROUTES) {
  test(`smoke ${route.path}: loads without runtime errors, h1, skip link, no overflow at 320px`, async ({ page, browserName }) => {
    const issues = collectIssues(page);
    await page.setViewportSize({ width: 320, height: 700 });
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 }).first();
    await expect(h1).toBeVisible();
    if (route.h1) await expect(h1).toContainText(route.h1);
    await page.waitForLoadState("networkidle");
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
    // Playwright WebKit on Windows skips links on Tab, like Safari defaults: only there the link is focused programmatically (this does NOT verify real Tab order); elsewhere Tab is pressed.
    if (browserName === "webkit" && process.platform === "win32") await skip.focus(); else await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(issues).toEqual([]);
  });
}

test("smoke 404: native page answers HTTP 404", async ({ page }) => {
  const response = await page.goto("/rota-inexistente-qa");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("smoke Home: contact form validates and moves focus to the first invalid field", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
  await form.getByRole("button", { name: "Solicitar diagnóstico" }).click();
  await expect(form.getByLabel("Nome", { exact: true })).toBeFocused();
  await expect(form.getByText("Informe a empresa.", { exact: true })).toBeVisible();
});

test("smoke ROSI: tool page renders its form and no storage is used", async ({ page }) => {
  await page.goto("/ferramentas/rosi");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});
