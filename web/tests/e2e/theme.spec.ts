import { expect, test, type Locator, type Page } from "@playwright/test";
import { collectIssues } from "./qa-shared";

const KEY = "rt-theme:v1";
const LIGHT_BG = "rgb(245, 245, 242)";
const DARK_BG = "rgb(23, 23, 23)";
const HOME_LINK = "Root Trust — página inicial";
const PATH = "/privacidade";

type Win = Window & { __storageWrites?: string[]; __themeAtBody?: string | null; __spa?: boolean; __nodes?: Record<string, Element | null> };

const themeSelect = (page: Page): Locator => page.locator("header").getByLabel("Tema", { exact: true });

async function choose(page: Page, value: "system" | "light" | "dark") {
  await expect(themeSelect(page)).toBeEnabled();
  await themeSelect(page).selectOption(value);
  await expect(page.locator("html")).toHaveAttribute("data-theme-pref", value);
}

const snapshot = (page: Page) => page.evaluate(() => {
  const root = document.documentElement;
  const logo = document.querySelector<HTMLElement>('header [role="img"]');
  return {
    theme: root.getAttribute("data-theme"),
    pref: root.getAttribute("data-theme-pref"),
    scheme: getComputedStyle(root).getPropertyValue("color-scheme"),
    bg: getComputedStyle(document.body).backgroundColor,
    logo: logo ? getComputedStyle(logo).backgroundImage : "",
  };
});

const isLight = (state: Awaited<ReturnType<typeof snapshot>>) => state.bg === LIGHT_BG && state.scheme === "light" && state.logo.includes("roottrust-horizontal-positivo.svg");
const isDark = (state: Awaited<ReturnType<typeof snapshot>>) => state.bg === DARK_BG && state.scheme === "dark" && state.logo.includes("roottrust-horizontal-negativo.svg");

async function recordStorageWrites(page: Page, initial?: string) {
  await page.addInitScript(({ key, seed }) => {
    if (seed !== null) localStorage.setItem(key, seed);
    const writes: string[] = [];
    (window as Win).__storageWrites = writes;
    for (const name of ["setItem", "removeItem", "clear"] as const) {
      const original = Storage.prototype[name] as (...args: string[]) => void;
      Object.defineProperty(Storage.prototype, name, {
        configurable: true, writable: true,
        value(this: Storage, ...args: string[]) {
          writes.push(`${this === window.localStorage ? "local" : "session"}.${name}:${args.join("=")}`);
          return original.apply(this, args);
        },
      });
    }
  }, { key: KEY, seed: initial ?? null });
}

const writes = (page: Page) => page.evaluate(() => (window as Win).__storageWrites ?? []);

test.describe("tema: preferência do sistema", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`SO ${scheme} inicial: tokens, assinatura oficial e nenhuma escrita por visita`, async ({ page }) => {
      const issues = collectIssues(page);
      await recordStorageWrites(page);
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(PATH);
      await expect(themeSelect(page)).toHaveValue("system");
      const state = await snapshot(page);
      expect(state.pref).toBe("system");
      expect(state.theme).toBeNull();
      expect(scheme === "light" ? isLight(state) : isDark(state)).toBe(true);
      expect(await writes(page)).toEqual([]);
      await page.goto("/");
      await page.getByRole("heading", { level: 1 }).first().waitFor();
      expect(await writes(page)).toEqual([]);
      expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }))).toEqual({ local: 0, session: 0, cookie: "" });
      expect(issues).toEqual([]);
    });
  }

  test("CSS segue prefers-color-scheme sem JavaScript", async ({ browser, baseURL }) => {
    for (const scheme of ["light", "dark"] as const) {
      const context = await browser.newContext({ baseURL, javaScriptEnabled: false, colorScheme: scheme });
      try {
        const page = await context.newPage();
        await page.goto(PATH);
        const state = await snapshot(page);
        expect(state.theme).toBeNull();
        expect(state.pref).toBeNull();
        expect(scheme === "light" ? isLight(state) : isDark(state)).toBe(true);
      } finally {
        await context.close();
      }
    }
  });

  test("modo Sistema reage a mudanças do SO sem recarregar nem escrever", async ({ page }) => {
    await recordStorageWrites(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(PATH);
    expect(isDark(await snapshot(page))).toBe(true);
    await page.emulateMedia({ colorScheme: "light" });
    await expect.poll(async () => isLight(await snapshot(page))).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(async () => isDark(await snapshot(page))).toBe(true);
    await expect(themeSelect(page)).toHaveValue("system");
    expect(await writes(page)).toEqual([]);
  });
});

test.describe("tema: escolha manual", () => {
  test("seletor aguarda hidratação e aplica a primeira escolha uma única vez", async ({ page }) => {
    await recordStorageWrites(page, "light");
    await page.emulateMedia({ colorScheme: "dark" });
    let release = () => {};
    const hydration = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/_next/static/**", async route => {
      if (new URL(route.request().url()).pathname.endsWith(".js")) await hydration;
      await route.continue();
    });
    try {
      await page.goto(PATH, { waitUntil: "domcontentloaded" });
      await expect(themeSelect(page)).toBeDisabled();
      expect(isLight(await snapshot(page))).toBe(true);
      release();
      await expect(themeSelect(page)).toBeEnabled();
      await expect(themeSelect(page)).toHaveValue("light");
      await themeSelect(page).selectOption("dark");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(await writes(page)).toEqual([`local.setItem:${KEY}=dark`]);
    } finally {
      release();
    }
  });

  test("manual prevalece sobre o SO; só a preferência é gravada, e Sistema volta a seguir o SO", async ({ page }) => {
    const issues = collectIssues(page);
    await recordStorageWrites(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(PATH);
    expect(await writes(page)).toEqual([]);

    await choose(page, "light");
    expect(isLight(await snapshot(page))).toBe(true);
    expect(await writes(page)).toEqual([`local.setItem:${KEY}=light`]);
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([KEY]);

    await page.emulateMedia({ colorScheme: "light" });
    await choose(page, "dark");
    const dark = await snapshot(page);
    expect(dark.theme).toBe("dark");
    expect(isDark(dark)).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.emulateMedia({ colorScheme: "light" });
    expect(isDark(await snapshot(page))).toBe(true);

    await choose(page, "system");
    const system = await snapshot(page);
    expect(system.theme).toBeNull();
    expect(system.pref).toBe("system");
    expect(isLight(system)).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(async () => isDark(await snapshot(page))).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem("rt-theme:v1"))).toBe("system");
    expect(await page.evaluate(() => ({ session: sessionStorage.length, cookie: document.cookie }))).toEqual({ session: 0, cookie: "" });
    expect(issues).toEqual([]);
  });

  test("reload preserva a escolha e o bootstrap define o tema antes do <body>, sem erro de hidratação", async ({ page }) => {
    const issues = collectIssues(page);
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        if (!document.body) return;
        (window as Win).__themeAtBody = document.documentElement.getAttribute("data-theme");
        observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(PATH);
    await choose(page, "light");
    for (const path of [PATH, "/"]) {
      await page.goto(path);
      await page.getByRole("heading", { level: 1 }).first().waitFor();
      expect(await page.evaluate(() => (window as Win).__themeAtBody)).toBe("light");
      await expect(themeSelect(page)).toHaveValue("light");
      expect(isLight(await snapshot(page))).toBe(true);
    }
    await page.reload();
    await expect(themeSelect(page)).toHaveValue("light");
    expect(isLight(await snapshot(page))).toBe(true);
    expect(issues).toEqual([]);
  });

  test("navegação SPA mantém escolha, atributos, seletor e árvore sem remontar", async ({ page }) => {
    const issues = collectIssues(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(PATH);
    await choose(page, "light");
    await page.evaluate(() => {
      (window as Win).__spa = true;
      (window as Win).__nodes = { header: document.querySelector("header"), select: document.querySelector("header select") };
    });
    await page.getByRole("link", { name: HOME_LINK, exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    expect(await page.evaluate(() => (window as Win).__spa)).toBe(true);
    expect(await page.evaluate(() => {
      const nodes = (window as Win).__nodes!;
      return nodes.header === document.querySelector("header") && nodes.select === document.querySelector("header select");
    })).toBe(true);
    await expect(themeSelect(page)).toHaveValue("light");
    expect(isLight(await snapshot(page))).toBe(true);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(themeSelect(page)).toHaveValue("light");
    expect(isLight(await snapshot(page))).toBe(true);
    expect(issues).toEqual([]);
  });

  test("trocar de tema não remonta a árvore, não anima e não muda o layout", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(PATH);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    const before = await page.evaluate(() => {
      (window as Win).__nodes = { header: document.querySelector("header"), main: document.querySelector("main"), footer: document.querySelector("footer") };
      const logo = document.querySelector('header [role="img"]')!.getBoundingClientRect();
      return { height: document.documentElement.scrollHeight, logo: [logo.left, logo.top, logo.width, logo.height] };
    });
    await choose(page, "light");
    const after = await page.evaluate(() => {
      const nodes = (window as Win).__nodes!;
      const logo = document.querySelector('header [role="img"]')!.getBoundingClientRect();
      return {
        same: nodes.header === document.querySelector("header") && nodes.main === document.querySelector("main") && nodes.footer === document.querySelector("footer"),
        height: document.documentElement.scrollHeight,
        logo: [logo.left, logo.top, logo.width, logo.height],
        transitions: [document.body, document.querySelector("header")!].map(el => getComputedStyle(el).transitionDuration),
        bg: getComputedStyle(document.body).backgroundColor,
      };
    });
    expect(after.same).toBe(true);
    expect(after.height).toBe(before.height);
    expect(after.logo).toEqual(before.logo);
    expect(after.transitions).toEqual(["0s", "0s"]);
    expect(after.bg).toBe(LIGHT_BG);
  });
});

test.describe("tema: armazenamento indisponível ou inválido", () => {
  for (const stored of ["banana", "LIGHT", "{\"v\":1}", ""]) {
    test(`valor inválido ${JSON.stringify(stored)} cai em Sistema sem erro nem escrita`, async ({ page }) => {
      const issues = collectIssues(page);
      await recordStorageWrites(page, stored);
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(PATH);
      await expect(themeSelect(page)).toHaveValue("system");
      const state = await snapshot(page);
      expect(state.pref).toBe("system");
      expect(state.theme).toBeNull();
      expect(isLight(state)).toBe(true);
      expect(await writes(page)).toEqual([]);
      expect(issues).toEqual([]);
    });
  }

  test("localStorage negado: leitura e escolha não quebram; a escolha dura a sessão SPA", async ({ page }) => {
    const issues = collectIssues(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("denied", "SecurityError"); } });
    });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(PATH);
    await expect(themeSelect(page)).toHaveValue("system");
    expect(isLight(await snapshot(page))).toBe(true);
    await choose(page, "dark");
    expect(isDark(await snapshot(page))).toBe(true);
    await page.getByRole("link", { name: HOME_LINK, exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await expect(themeSelect(page)).toHaveValue("dark");
    expect(isDark(await snapshot(page))).toBe(true);
    await page.reload();
    await expect(themeSelect(page)).toHaveValue("system");
    expect(isLight(await snapshot(page))).toBe(true);
    expect(issues).toEqual([]);
  });

  test("setItem negado (cota/privacidade): escolha aplicada, sem erro", async ({ page }) => {
    const issues = collectIssues(page);
    await page.addInitScript(() => {
      Object.defineProperty(Storage.prototype, "setItem", { configurable: true, writable: true, value() { throw new DOMException("quota", "QuotaExceededError"); } });
    });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(PATH);
    await choose(page, "dark");
    expect(isDark(await snapshot(page))).toBe(true);
    await expect(themeSelect(page)).toHaveValue("dark");
    expect(issues).toEqual([]);
  });
});

test.describe("tema: shell, assinatura e acessibilidade", () => {
  test("header não sobrepõe controles nas transições de layout", async ({ page }) => {
    await page.goto(PATH);
    await expect(themeSelect(page)).toBeEnabled();
    for (const width of [560, 600, 768, 959, 960, 1099, 1100]) {
      await page.setViewportSize({ width, height: 800 });
      const controls = await page.locator("header > div").evaluate(bar => [...bar.querySelectorAll("a, button, select")]
        .map(element => element.getBoundingClientRect())
        .filter(rect => rect.width > 0 && rect.height > 0)
        .map(rect => ({ left: rect.left, right: rect.right })));
      for (let index = 0; index < controls.length; index++) {
        expect(controls[index].left, `viewport ${width}`).toBeGreaterThanOrEqual(0);
        expect(controls[index].right, `viewport ${width}`).toBeLessThanOrEqual(width);
        if (index > 0) expect(controls[index].left, `viewport ${width}`).toBeGreaterThanOrEqual(controls[index - 1].right);
      }
    }
  });

  test("logo mantém proporção oficial, cresce no desktop e cabe a 320 px com seletor e menu em ambos os temas", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(PATH);
      const desktop = await page.evaluate(() => {
        const logo = document.querySelector('header [role="img"]')!.getBoundingClientRect();
        const bar = document.querySelector("header > div")!.getBoundingClientRect();
        return { w: logo.width, h: logo.height, bar: bar.height, padding: getComputedStyle(document.documentElement).scrollPaddingTop };
      });
      expect(desktop.h).toBeGreaterThanOrEqual(42);
      expect(desktop.h).toBeLessThanOrEqual(45);
      expect(desktop.w / desktop.h).toBeCloseTo(1156.5 / 344.5, 1);
      expect(Math.round(desktop.bar)).toBe(76);
      expect(desktop.padding).toBe("96px");
      await expect(page.locator("header").getByText("Tema", { exact: true })).toBeVisible();

      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 700 });
        const mobile = await page.evaluate(() => {
          const rect = (selector: string) => { const box = document.querySelector(selector)!.getBoundingClientRect(); return { left: box.left, right: box.right, width: box.width, height: box.height }; };
          return { logo: rect('header [role="img"]'), select: rect("header select"), toggle: rect('header button[aria-controls="mobile-navigation"]'), scroll: document.documentElement.scrollWidth, inner: innerWidth, padding: parseFloat(getComputedStyle(document.querySelector("header > div")!).paddingRight) };
        });
        expect(mobile.scroll).toBeLessThanOrEqual(mobile.inner);
        expect(mobile.logo.left).toBeGreaterThanOrEqual(0);
        expect(mobile.logo.height).toBeLessThanOrEqual(36);
        expect(mobile.logo.width / mobile.logo.height).toBeCloseTo(1156.5 / 344.5, 1);
        expect(mobile.logo.right).toBeLessThanOrEqual(mobile.select.left);
        expect(mobile.select.right).toBeLessThanOrEqual(mobile.toggle.left);
        expect(mobile.toggle.right).toBeLessThanOrEqual(mobile.inner - mobile.padding + 0.5);
        expect(await page.locator("header").getByText("Tema", { exact: true }).evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
        await expect(themeSelect(page)).toBeVisible();
      }
    }
  });

  test("rodapé usa uma única assinatura oficial por tema, sem DOM duplicado", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(PATH);
      const footer = await page.evaluate(() => {
        const logos = [...document.querySelectorAll<HTMLElement>('footer [role="img"]')];
        const box = logos[0]?.getBoundingClientRect();
        return { count: logos.length, image: logos[0] ? getComputedStyle(logos[0]).backgroundImage : "", ratio: box ? box.width / box.height : 0, filter: logos[0] ? getComputedStyle(logos[0]).filter : "" };
      });
      expect(footer.count).toBe(1);
      expect(footer.image).toContain(scheme === "light" ? "roottrust-horizontal-positivo.svg" : "roottrust-horizontal-negativo.svg");
      expect(footer.ratio).toBeCloseTo(1156.5 / 344.5, 1);
      expect(footer.filter).toBe("none");
      expect(await page.locator('header [role="img"]').count()).toBe(1);
      expect(await page.locator('[role="img"][aria-label="roottrust"]').count()).toBe(2);
    }
  });

  test("seletor: ordem de Tab, foco visível, nome acessível e Escape do menu preservados", async ({ page }) => {
    await page.goto(PATH);
    const select = themeSelect(page);
    await expect(select).toBeEnabled();
    await expect(select.locator("option")).toHaveText(["Sistema", "Claro", "Escuro"]);
    await page.getByRole("link", { name: HOME_LINK, exact: true }).focus();
    let reached = false;
    for (let step = 0; step < 6 && !reached; step++) {
      await page.keyboard.press("Tab");
      reached = await select.evaluate(el => el === document.activeElement);
    }
    expect(reached).toBe(true);
    const ring = await select.evaluate(el => {
      const focused = getComputedStyle(el);
      return { style: focused.outlineStyle, width: parseFloat(focused.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThan(0);
    await page.keyboard.press("Tab");
    const next = await page.evaluate(() => (document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? "").trim());
    expect(next).toMatch(/Solicitar diagnóstico|Abrir menu/);

    const menu = page.getByRole("button", { name: "Abrir menu" });
    if (await menu.isVisible()) {
      await menu.click();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
    }
  });

  test("forced-colors mantém o seletor nativo e a assinatura sobre placa própria", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(PATH);
    const state = await page.evaluate(() => {
      const select = document.querySelector("header select")!;
      const arrow = getComputedStyle(select.parentElement!, "::after");
      const logo = getComputedStyle(document.querySelector('header [role="img"]')!);
      return { appearance: getComputedStyle(select).getPropertyValue("appearance"), arrow: arrow.display, adjust: logo.getPropertyValue("forced-color-adjust") };
    });
    expect(state.appearance).toBe("auto");
    expect(state.arrow).toBe("none");
    expect(state.adjust).toBe("none");
  });
});
