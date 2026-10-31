import { expect, test } from "@playwright/test";

for (const scenario of [
  { path: "/", formName: "Assinar newsletter" },
  { path: "/newsletter", formName: "Assinar newsletter" },
  { path: "/ferramentas/rosi", formName: /^Receber relatório de/ },
]) {
test(`Turnstile ${scenario.path}: largura integral, resize e tokens`, async ({ page }) => {
  test.skip(process.env.TURNSTILE_FAKE_TEST !== "1", "Executar com servidor local de teste configurado para o modo público e provedor simulado.");
  await page.route("**/api/**", (route) => route.abort());
  await page.route("https://**", (route) => route.abort());
  await page.addInitScript(() => {
    const NativeObserver = window.ResizeObserver;
    const observers: { callback: ResizeObserverCallback; target?: Element }[] = [];
    window.ResizeObserver = class extends NativeObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback);
        const record = { callback, target: undefined as Element | undefined };
        observers.push(record);
        const observe = this.observe.bind(this);
        this.observe = (target, options) => { record.target = target; observe(target, options); };
      }
    };
    Object.assign(window, { __widgetObservers: observers });
    const state = { renders: [] as { size: string; theme: string; callback: (token: string) => void }[], removes: [] as string[] };
    Object.assign(window, { __widgetTest: state, turnstile: {
      render(element: HTMLElement, options: { size: string; theme: string; callback: (token: string) => void }) {
        state.renders.push(options);
        const frame = document.createElement("div");
        frame.dataset.fakeWidget = "true";
        frame.style.width = options.size === "flexible" ? "100%" : "150px";
        frame.style.height = options.size === "flexible" ? "65px" : "140px";
        element.append(frame);
        return String(state.renders.length);
      },
      remove(id: string) { state.removes.push(id); document.querySelector('[data-fake-widget]')?.remove(); },
      reset() {},
    } });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(scenario.path);
  const form = page.getByRole("form", { name: scenario.formName });
  const input = form.getByLabel("Seu e-mail");
  await input.fill("reader@example.com");
  const submit = form.locator('button[type="submit"]');
  const widget = form.getByRole("group", { name: "Verificação de segurança" });
  await expect(widget).toBeVisible();
  const state = () => page.evaluate(() => (window as unknown as { __widgetTest: { renders: { size: string; theme: string }[]; removes: string[] } }).__widgetTest);
  await expect.poll(async () => (await state()).renders.length).toBe(1);
  expect((await state()).renders[0].size).toBe("flexible");
  expect(await widget.evaluate((element) => Math.abs(element.getBoundingClientRect().width - element.parentElement!.getBoundingClientRect().width))).toBeLessThan(1);
  await page.evaluate(() => (window as unknown as { __widgetTest: { renders: { callback: (token: string) => void }[] } }).__widgetTest.renders[0].callback("first"));
  await expect(submit).toBeEnabled();
  await page.locator("header").getByRole("button", { name: /^Tema atual:/ }).click();
  await expect.poll(async () => (await state()).renders.length).toBe(2);
  expect((await state()).renders.map((item) => item.theme)).toEqual(["dark", "light"]);
  await expect(widget).toHaveAttribute("data-widget-theme", "light");
  await expect(submit).toBeDisabled();
  await page.evaluate(() => {
    const old = (window as unknown as { __widgetTest: { renders: Record<string, (token?: string) => void>[] } }).__widgetTest.renders[0];
    old.callback("stale");
    old["expired-callback"](); old["timeout-callback"](); old["error-callback"]();
  });
  await expect(submit).toBeDisabled();
  await expect(widget.getByRole("button", { name: "Tentar novamente" })).toHaveCount(0);
  await expect(input).toHaveValue("reader@example.com");
  await page.evaluate(() => (window as unknown as { __widgetTest: { renders: { callback: (token: string) => void }[] } }).__widgetTest.renders[1].callback("after-theme"));
  await expect(submit).toBeEnabled();
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(100);
  expect((await state()).renders).toHaveLength(2);
  await expect(submit).toBeEnabled();
  await page.setViewportSize({ width: 1000, height: 900 });
  expect((await state()).renders).toHaveLength(2);
  await expect(submit).toBeEnabled();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect.poll(async () => (await state()).renders.length).toBe(3);
  expect((await state()).renders.map((item) => item.size)).toEqual(["flexible", "flexible", "compact"]);
  expect((await state()).removes).toEqual(["1", "2"]);
  await expect(submit).toBeDisabled();
  await page.evaluate(() => (window as unknown as { __widgetTest: { renders: { callback: (token: string) => void }[] } }).__widgetTest.renders[1].callback("stale"));
  await expect(submit).toBeDisabled();
  await expect(input).toHaveValue("reader@example.com");
  await page.evaluate(() => (window as unknown as { __widgetTest: { renders: { callback: (token: string) => void }[] } }).__widgetTest.renders[2].callback("second"));
  await expect(submit).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(async () => (await state()).renders.length).toBe(4);
  expect((await state()).renders[3].theme).toBe("light");
  await expect(submit).toBeDisabled();

  await page.evaluate(() => {
    const state = (window as unknown as { __widgetTest: { renders: { callback: (token: string) => void }[] } }).__widgetTest;
    state.renders[3].callback("before-batched-resize");
  });
  await expect(submit).toBeEnabled();
  await widget.evaluate((element) => {
    const observers = (window as unknown as { __widgetObservers: { callback: ResizeObserverCallback; target?: Element }[] }).__widgetObservers;
    const observer = observers.find(item => item.target === element.firstElementChild)!;
    for (const width of [250, 500]) {
      observer.callback([{ contentRect: { width } } as ResizeObserverEntry], {} as ResizeObserver);
    }
  });
  await expect.poll(async () => (await state()).renders.length).toBe(5);
  await expect(submit).toBeDisabled();
  await page.evaluate(() => (window as unknown as { __widgetTest: { renders: { callback: (token: string) => void }[] } }).__widgetTest.renders[3].callback("obsolete-batch"));
  await expect(submit).toBeDisabled();
  await page.evaluate(() => (window as unknown as { __widgetTest: { renders: { callback: (token: string) => void }[] } }).__widgetTest.renders[4].callback("after-batched-resize"));
  await expect(submit).toBeEnabled();
});
}

test("Turnstile segue o sistema, respeita superfície local e descarta callbacks após desmontagem", async ({ page }) => {
  test.skip(process.env.TURNSTILE_FAKE_TEST !== "1", "Executar configuração dedicada com provedor simulado.");
  await page.route("**/api/**", (route) => route.abort());
  await page.route("https://**", (route) => route.abort());
  await page.addInitScript(() => {
    const state = { renders: [] as { theme: string; callback: (token: string) => void }[], removed: [] as string[] };
    Object.assign(window, { __themeWidget: state, turnstile: {
      render(element: HTMLElement, options: { theme: string; callback: (token: string) => void }) {
        state.renders.push(options); element.append(document.createElement("div")); return String(state.renders.length);
      },
      remove(id: string) { state.removed.push(id); }, reset() {},
    } });
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const form = page.getByRole("form", { name: "Assinar newsletter" });
  await form.getByLabel("Seu e-mail").fill("reader@example.com");
  const submit = form.locator('button[type="submit"]');
  const state = () => page.evaluate(() => (window as unknown as { __themeWidget: { renders: { theme: string }[]; removed: string[] } }).__themeWidget);
  await expect.poll(async () => (await state()).renders.length).toBe(1);
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(async () => (await state()).renders.length).toBe(2);
  expect((await state()).renders.map(item => item.theme)).toEqual(["dark", "light"]);
  await page.evaluate(() => (window as unknown as { __themeWidget: { renders: { callback: (token: string) => void }[] } }).__themeWidget.renders[1].callback("fresh"));
  await expect(submit).toBeEnabled();
  await form.evaluate((element) => { element.style.colorScheme = "light"; });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(100);
  expect((await state()).renders).toHaveLength(2);
  await expect(submit).toBeEnabled();
  await page.getByRole("link", { name: /Privacidade/ }).first().click();
  await expect.poll(async () => (await state()).removed.length).toBe(2);
  await page.evaluate(() => (window as unknown as { __themeWidget: { renders: { callback: (token: string) => void }[] } }).__themeWidget.renders[1].callback("after-unmount"));
  expect((await state()).renders).toHaveLength(2);
});
