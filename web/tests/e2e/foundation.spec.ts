import { expect, test } from "@playwright/test";

test("server content, local resources and keyboard navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Confiabilidade com profundidade.");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  const menu = page.getByRole("button", { name: "Abrir menu" });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("contact validates, prevents duplicate requests, and retains fields after demo failure", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
  const submit = form.getByRole("button", { name: "Solicitar diagnóstico" });
  await expect(submit).toBeEnabled();
  await page.clock.pauseAt(Date.now() + 1000);
  await submit.click();
  await expect(form.getByLabel("Nome", { exact: true })).toBeFocused();
  await expect(form.getByText("Informe a empresa.", { exact: true })).toBeVisible();
  await form.getByLabel("Nome", { exact: true }).fill("Pessoa de teste");
  await form.getByLabel("Empresa", { exact: true }).fill("Empresa demonstrativa");
  await form.getByLabel("WhatsApp", { exact: true }).fill("abc11940084692");
  await form.getByRole("button", { name: "Solicitar diagnóstico" }).click();
  await expect(form.getByLabel("WhatsApp", { exact: true })).toBeFocused();
  await expect(form.getByLabel("WhatsApp", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await form.getByLabel("WhatsApp", { exact: true }).fill("11940084692");
  await form.getByLabel("Resultado da demonstração").selectOption("error");
  const requests: string[] = [];
  page.on("request", (request) => { if (request.method() !== "GET") requests.push(request.url()); });
  // Counts the 350ms submission timers scheduled from here on, so the duplicate guard is observable beyond `disabled`.
  await page.evaluate(() => {
    const w = window as Window & { __submitTimers?: number };
    w.__submitTimers = 0;
    const original = window.setTimeout;
    window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
      if (delay === 350) w.__submitTimers = (w.__submitTimers ?? 0) + 1;
      return original.call(window, handler, delay, ...args);
    }) as typeof window.setTimeout;
  });
  const submitTimers = () => page.evaluate(() => (window as Window & { __submitTimers?: number }).__submitTimers);
  const busyButton = form.getByRole("button", { name: "Enviando solicitação…" });

  // Two submit events in the same tick while the first request is still active.
  await page.evaluate(() => {
    const target = document.querySelector<HTMLFormElement>('form[aria-label="Solicitar diagnóstico"]');
    if (!target) throw new Error("Contact form not found");
    target.requestSubmit();
    target.requestSubmit();
  });
  await expect(busyButton).toBeDisabled();
  await expect(form).toHaveAttribute("aria-busy", "true");
  expect(await submitTimers()).toBe(1);
  await page.clock.runFor(349);
  await expect(busyButton).toBeDisabled();
  await expect(form).toHaveAttribute("aria-busy", "true");
  await page.clock.runFor(1);
  await expect(form.getByRole("status")).toContainText("Tente novamente");
  await expect(form).toHaveAttribute("aria-busy", "false");
  await expect(submit).toBeEnabled();
  await expect(form.getByLabel("Nome", { exact: true })).toHaveValue("Pessoa de teste");
  await expect(form.getByLabel("Empresa", { exact: true })).toHaveValue("Empresa demonstrativa");
  await expect(form.getByLabel("WhatsApp", { exact: true })).toHaveValue("11940084692");
  await form.getByLabel("Resultado da demonstração").selectOption("success");
  await form.getByLabel("WhatsApp", { exact: true }).press("Enter");
  await expect(busyButton).toBeDisabled();
  await expect(form).toHaveAttribute("aria-busy", "true");
  expect(await submitTimers()).toBe(2);
  await page.clock.runFor(350);
  await expect(form.getByRole("status")).toContainText("Nenhum dado foi enviado");
  await expect(form.getByRole("status")).toContainText("aceita localmente");
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("newsletter accepts only a local request, without confirming registration", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("form", { name: "Assinar newsletter" });
  await form.getByRole("button", { name: "Assinar" }).click();
  await expect(form.getByLabel("Seu e-mail", { exact: true })).toBeFocused();
  await expect(form.getByText("Informe um endereço de e-mail válido.", { exact: true })).toBeVisible();
  await form.getByLabel("Seu e-mail", { exact: true }).fill("leitor@ex..com");
  await form.getByRole("button", { name: "Assinar" }).click();
  await expect(form.getByLabel("Seu e-mail", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await form.getByLabel("Seu e-mail", { exact: true }).fill("leitor@example.com");
  await form.getByLabel("Seu e-mail", { exact: true }).press("Enter");
  await expect(form.getByRole("status")).toContainText("aguardando confirmação");
  await expect(form.getByRole("status")).not.toContainText("Inscrição confirmada");
});

test("without JavaScript personal fields cannot be submitted to the URL", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
    await expect(form.getByLabel("Nome", { exact: true })).toBeEditable();
    await expect(form.getByRole("button", { name: "Solicitar diagnóstico" })).toBeDisabled();
  } finally { await context.close(); }
});

test("default mode keeps fields active and never claims successful receipt", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/");
  const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
  await expect(form.getByLabel("Resultado da demonstração")).toHaveCount(0);
  await form.getByLabel("Nome", { exact: true }).fill("Pessoa de teste");
  await form.getByLabel("Empresa", { exact: true }).fill("Empresa demonstrativa");
  await form.getByLabel("WhatsApp", { exact: true }).fill("11940084692");
  await form.getByRole("button", { name: "Solicitar diagnóstico" }).click();
  await expect(form.getByRole("status")).toHaveText("O envio ainda não está disponível. Nenhum dado foi enviado.");
});

test("320px foundation keeps menu and form validation within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação móvel" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  const form = page.getByRole("form", { name: "Solicitar diagnóstico" });
  await form.getByRole("button", { name: "Solicitar diagnóstico" }).click();
  await expect(form.getByLabel("Nome", { exact: true })).toBeFocused();
  await expect(form.getByText("Informe um número com DDD.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
