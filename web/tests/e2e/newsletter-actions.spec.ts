import { expect, test } from "@playwright/test";

for (const [route, label] of [
  ["confirmar", "Confirmar endereço"],
  ["cancelar", "Cancelar próximos envios"],
] as const) test(`newsletter ${route} requires an explicit action and keeps the token out of the URL`, async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes(`/api/newsletter/${route}`)) posts.push(request.url());
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(`/newsletter/${route}#token=opaque-test-token`);
  const button = page.getByRole("button", { name: label });
  await expect(button).toBeVisible();
  expect(page.url()).not.toContain("opaque-test-token");
  expect(posts).toHaveLength(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Não foi possível");
  expect(posts).toHaveLength(1);
});
