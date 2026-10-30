import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: feedback keeps its live node, fields and local-only submission across theme changes`, async ({ page }) => {
    await page.clock.install();
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST") posts.push(request.url()); });
    await page.goto("/");
    const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
    const submit = form.locator('button[type="submit"]');
    await expect(submit).toBeEnabled();
    const live = form.getByRole("status");
    await expect(live).toHaveText("");
    await expect(form.locator("[data-tone]")).toHaveCount(0);
    const original = await live.elementHandle();
    await page.clock.pauseAt(Date.now() + 1000);
    await form.getByLabel("Nome", { exact: true }).fill("Pessoa de teste");
    await form.getByLabel("Empresa", { exact: true }).fill("Empresa demonstrativa");
    await form.getByLabel("WhatsApp", { exact: true }).fill("11940084692");
    await form.getByLabel("Resultado da demonstração").selectOption("error");
    await submit.click();
    await expect(live).toHaveText("Enviando solicitação…");
    await expect(submit).toBeDisabled();
    await page.clock.runFor(350);
    await expect(form.locator('[data-tone="problem"]')).toBeVisible();
    await expect(live).toContainText("Nenhum dado foi enviado");
    await expect(live).toHaveCount(1);
    expect(await live.evaluate((node, initial) => node === initial, original)).toBe(true);
    const selector = page.locator("header").getByLabel("Tema", { exact: true });
    await expect(selector).toBeEnabled();
    await selector.selectOption(theme === "light" ? "dark" : "light");
    await expect(form.getByLabel("Empresa", { exact: true })).toHaveValue("Empresa demonstrativa");
    await expect(live).toContainText("Nenhum dado foi enviado");
    await form.getByLabel("Resultado da demonstração").selectOption("success");
    await submit.click();
    await page.clock.runFor(350);
    await expect(live).toContainText("aceita localmente");
    await expect(form.locator('[data-tone="info"] svg')).toHaveAttribute("aria-hidden", "true");
    expect(await live.evaluate((node, initial) => node === initial, original)).toBe(true);
    expect(posts).toEqual([]);
    expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: sessionStorage.length }))).toEqual({ local: ["rt-theme:v1"], session: 0 });
  });

  test(`${theme}: Home fields and feedback have contrast and reflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/");
    const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
    const submit = form.getByRole("button", { name: "Solicitar diagnóstico" });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(form.getByLabel("Nome", { exact: true })).toBeFocused();
    await expect(form.getByLabel("Nome", { exact: true })).toHaveAttribute("aria-describedby", /-name-error$/);
    await form.getByLabel("Nome", { exact: true }).fill("a".repeat(121));
    await form.getByLabel("Empresa", { exact: true }).fill("Empresa demonstrativa");
    await form.getByLabel("WhatsApp", { exact: true }).fill("11940084692");
    await submit.click();
    await expect(form.getByText("Use até 120 caracteres no nome.")).toBeVisible();
    await form.getByLabel("Nome", { exact: true }).fill("Pessoa de teste");
    await form.getByLabel("Resultado da demonstração").selectOption("error");
    await submit.click();
    await expect(form.locator('[data-tone="problem"]')).toBeVisible();
    const contrasts = await form.evaluate(element => {
      const luminance = (color: string) => {
        const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
          const v = value / 255;
          return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
        });
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      };
      const ratio = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
      const input = getComputedStyle(element.querySelector('input[name="company"]')!);
      const feedback = getComputedStyle(element.querySelector("[data-tone]")!);
      const label = getComputedStyle(element.querySelector("label")!);
      if (input.backgroundColor !== "rgb(11, 71, 57)" || input.color !== "rgb(245, 245, 242)") throw new Error("Contact fields must use their brand surface, not browser defaults.");
      if (label.color !== input.color) throw new Error("Labels must resolve the form surface text color.");
      return { fieldBorder: ratio(input.borderColor, input.backgroundColor), fieldText: ratio(input.color, input.backgroundColor), feedbackText: ratio(feedback.color, feedback.backgroundColor) };
    });
    expect(contrasts.fieldBorder).toBeGreaterThanOrEqual(3);
    expect(contrasts.fieldText).toBeGreaterThanOrEqual(4.5);
    expect(contrasts.feedbackText).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
