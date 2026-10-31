import { expect, test, type Page, type Route } from "@playwright/test";

const ROUTES = [
  { route: "confirmar", label: "Confirmar endereço", sending: "Confirmando…", success: { status: "confirmed", editionQueued: false, selectedEditionUnavailable: false }, done: "Endereço confirmado" },
  { route: "cancelar", label: "Cancelar próximos envios", sending: "Cancelando…", success: { status: "cancelled" }, done: "Os próximos envios da newsletter foram cancelados" },
] as const;

type Reply = { status: number; body?: unknown } | "abort";

// Fake API: every POST is recorded and answered by the queue; nothing leaves the test browser.
async function fakeApi(page: Page, route: string, replies: Reply[]) {
  const bodies: unknown[] = [];
  await page.route(`**/api/newsletter/${route}`, async (handled: Route) => {
    bodies.push(handled.request().postDataJSON());
    const next = replies[Math.min(bodies.length - 1, replies.length - 1)];
    if (next === "abort") return handled.abort("failed");
    return handled.fulfill({ status: next.status, contentType: "application/json", body: next.body === undefined ? "" : JSON.stringify(next.body) });
  });
  return bodies;
}

async function open(page: Page, route: string, theme: "light" | "dark", hash = "#token=opaque-test-token") {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
  await page.goto(`/newsletter/${route}${hash}`);
  await expect(page).toHaveTitle(`${route === "confirmar" ? "Confirmar" : "Cancelar"} newsletter — Root Trust`);
}

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

for (const { route, label, sending, success, done } of ROUTES) {
  for (const theme of ["light", "dark"] as const) {
    test(`newsletter ${route} (${theme}) requires an explicit action, keeps the token out of the URL and sends one POST`, async ({ page }) => {
      let release: (() => void) | undefined;
      const gate = new Promise<void>((resolve) => { release = resolve; });
      const bodies: unknown[] = [];
      await page.route(`**/api/newsletter/${route}`, async (handled) => {
        bodies.push(handled.request().postDataJSON());
        await gate;
        await handled.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(success) });
      });
      await open(page, route, theme);
      const button = page.getByRole("button", { name: label });
      await expect(button).toBeVisible();
      expect(page.url()).not.toContain("opaque-test-token");
      expect(await page.evaluate(() => history.state)).not.toBeNull();
      expect(await page.evaluate(() => document.documentElement.innerHTML.includes("opaque-test-token"))).toBe(false);
      await expect(page.locator("main [data-tone]")).toHaveCount(0);
      await expect(page.getByRole("status")).toHaveText("");
      expect(bodies).toHaveLength(0);
      expect(await noOverflow(page)).toBe(true);

      await button.focus();
      await button.evaluate((element) => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
      await expect(page.getByRole("button", { name: sending })).toBeDisabled();
      await expect(page.locator('main [data-tone="progress"]')).toBeVisible();
      await expect.poll(() => bodies).toEqual([{ token: "opaque-test-token" }]);
      release?.();

      const panel = page.locator('main [data-tone="success"]');
      await expect(panel).toBeVisible();
      await expect(page.getByRole("status")).toContainText(done);
      await expect(panel.locator("svg")).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator("main").getByRole("button")).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Voltar à newsletter" })).toBeFocused();
      expect(await panel.evaluate((node) => getComputedStyle(node).color !== getComputedStyle(node).backgroundColor)).toBe(true);
      expect(await noOverflow(page)).toBe(true);
      expect(bodies).toHaveLength(1);
      expect(await page.evaluate(() => ({ local: Object.keys(localStorage).filter((key) => key !== "rt-theme:v1"), session: sessionStorage.length }))).toEqual({ local: [], session: 0 });
    });
  }
}

const FAILURES: Array<{ name: string; reply: Reply; text: RegExp; retry: boolean; link?: "Solicitar novo link" | "Falar com a Root Trust" }> = [
  { name: "503 unavailable", reply: { status: 503, body: { code: "not_operational" } }, text: /indisponível/, retry: true },
  { name: "429 with retryAfter", reply: { status: 429, body: { code: "rate_limited", retryAfter: 30 } }, text: /em 30 segundos/, retry: true },
  { name: "429 without retryAfter", reply: { status: 429 }, text: /Aguarde um pouco/, retry: true },
  { name: "500 server error", reply: { status: 500 }, text: /Não foi possível confirmar se/, retry: true },
  { name: "network failure", reply: "abort", text: /Não foi possível confirmar se/, retry: true },
  { name: "200 with unexpected body", reply: { status: 200, body: { status: "other" } }, text: /Não foi possível confirmar se/, retry: true },
  { name: "403 forbidden origin", reply: { status: 403, body: { code: "forbidden_origin" } }, text: /não está autorizada/, retry: false, link: "Falar com a Root Trust" },
];

for (const { route, label } of ROUTES) {
  FAILURES.forEach(({ name, reply, text, retry, link }, index) => {
    const theme = index % 2 === 0 ? "dark" : "light";
    test(`newsletter ${route} (${theme}): ${name} keeps the link and never calls it invalid`, async ({ page }) => {
      const bodies = await fakeApi(page, route, [reply, { status: 200, body: ROUTES.find((item) => item.route === route)?.success }]);
      await open(page, route, theme);
      await page.getByRole("button", { name: label }).click();
      const panel = page.locator('main [data-tone="problem"]');
      await expect(panel).toBeVisible();
      await expect(page.getByRole("status")).toContainText(text);
      await expect(page.getByRole("status")).not.toContainText(/inválid|expirou/);
      await expect(panel.locator("svg")).toHaveAttribute("aria-hidden", "true");
      expect(await noOverflow(page)).toBe(true);
      expect(bodies).toHaveLength(1);
      if (!retry) {
        await expect(page.locator("main").getByRole("button")).toHaveCount(0);
        if (link) await expect(page.getByRole("link", { name: link })).toBeVisible();
        return;
      }
      const again = page.getByRole("button", { name: "Tentar novamente" });
      await expect(again).toBeFocused();
      await page.waitForTimeout(300);
      expect(bodies).toHaveLength(1);
      await page.keyboard.press("Enter");
      await expect(page.locator('main [data-tone="success"]')).toBeVisible();
      expect(bodies).toEqual([{ token: "opaque-test-token" }, { token: "opaque-test-token" }]);
    });
  });
}

const CONSUMED: Array<{ name: string; route: "confirmar" | "cancelar"; status: number; body: unknown; text: RegExp; link: string }> = [
  { name: "400", route: "confirmar", status: 400, body: { code: "invalid_link" }, text: /não é válido ou está incompleto/, link: "Solicitar novo link" },
  { name: "409", route: "confirmar", status: 409, body: { code: "already_used" }, text: /não pode mais ser usado/, link: "Solicitar novo link" },
  { name: "410", route: "confirmar", status: 410, body: { code: "expired_link" }, text: /não pode mais ser usado/, link: "Solicitar novo link" },
  { name: "400", route: "cancelar", status: 400, body: { code: "invalid_link" }, text: /não é válido ou está incompleto/, link: "Falar com a Root Trust" },
  { name: "409", route: "cancelar", status: 409, body: { code: "invalid_link" }, text: /não pode mais ser usado/, link: "Falar com a Root Trust" },
];

CONSUMED.forEach(({ name, route, status, body, text, link }, index) => {
  const theme = index % 2 === 0 ? "light" : "dark";
  const label = ROUTES.find((item) => item.route === route)?.label ?? "";
  test(`newsletter ${route} (${theme}): ${name} consumes the token and offers a neutral next step`, async ({ page }) => {
    const bodies = await fakeApi(page, route, [{ status, body }]);
    await open(page, route, theme);
    await page.getByRole("button", { name: label }).click();
    await expect(page.locator('main [data-tone="problem"]')).toBeVisible();
    await expect(page.getByRole("status")).toContainText(text);
    await expect(page.getByRole("link", { name: link })).toBeVisible();
    await expect(page.locator("main").getByRole("button")).toHaveCount(0);
    expect(await noOverflow(page)).toBe(true);
    expect(bodies).toHaveLength(1);
  });
});

test("newsletter confirmar reports an unavailable selected edition without promising delivery", async ({ page }) => {
  await fakeApi(page, "confirmar", [{ status: 200, body: { status: "confirmed", editionQueued: false, selectedEditionUnavailable: true } }]);
  await open(page, "confirmar", "dark");
  await page.getByRole("button", { name: "Confirmar endereço" }).click();
  await expect(page.getByRole("status")).toContainText("não está disponível para envio");
  await expect(page.getByRole("status")).toContainText("sem garantia");
});

test("newsletter links without a token never post and show the invalid state", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (request) => { if (request.method() === "POST" && request.url().includes("/api/newsletter/")) posts.push(request.url()); });
  for (const route of ["confirmar", "cancelar"]) {
    await open(page, route, "light", "");
    await expect(page.locator('main [data-tone="problem"]')).toBeVisible();
    await expect(page.locator("main").getByRole("button")).toHaveCount(0);
  }
  expect(posts).toHaveLength(0);
});

test("a new fragment replaces the token, drops a pending result and an unrelated anchor keeps it", async ({ page }) => {
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const bodies: Array<{ token: string }> = [];
  await page.route("**/api/newsletter/confirmar", async (handled) => {
    const body = handled.request().postDataJSON() as { token: string };
    bodies.push(body);
    if (bodies.length === 1) await gate;
    try {
      await handled.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "confirmed", editionQueued: false, selectedEditionUnavailable: false }) });
    } catch (error) {
      if (!handled.request().failure()?.errorText.includes("ERR_ABORTED")) throw error;
    }
  });
  await open(page, "confirmar", "dark", "#token=first-token");
  const button = page.getByRole("button", { name: "Confirmar endereço" });
  await page.evaluate(() => { location.hash = "conteudo"; });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.getByRole("button", { name: "Confirmando…" })).toBeDisabled();
  await expect.poll(() => bodies).toEqual([{ token: "first-token" }]);

  await page.evaluate(() => { location.hash = "token=second-token"; });
  await expect(button).toBeEnabled();
  expect(page.url()).not.toContain("second-token");
  release?.();
  await page.waitForTimeout(300);
  await expect(page.locator("main [data-tone]")).toHaveCount(0);
  expect(bodies).toHaveLength(1);

  await button.click();
  await expect(page.locator('main [data-tone="success"]')).toBeVisible();
  expect(bodies).toEqual([{ token: "first-token" }, { token: "second-token" }]);
});
