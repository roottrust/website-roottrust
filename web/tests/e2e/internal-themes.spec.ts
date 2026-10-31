import { expect, test, type Locator, type Page } from "@playwright/test";
import { sortedEdicoes } from "../../src/features/newsletter/catalog";
import { collectIssues } from "./qa-shared";

const [recente] = sortedEdicoes();
const schemes = ["light", "dark"] as const;
type Scheme = (typeof schemes)[number];

const PAGE_BG = { light: "rgb(245, 245, 242)", dark: "rgb(23, 23, 23)" } as const;
const BAND_BG = "rgb(0, 52, 40)";

type Sample = { color: string; background: string; border: string; backgroundImage: string };

function parse(value: string): [number, number, number, number] {
  const match = value.match(/rgba?\(([^)]+)\)/) ?? value.match(/color\(srgb ([^)]+)\)/);
  if (!match) throw new Error(`cor não reconhecida: ${value}`);
  const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  const scale = value.startsWith("color(") ? 255 : 1;
  return [parts[0] * scale, parts[1] * scale, parts[2] * scale, parts[3] ?? 1];
}

function luminance([r, g, b]: number[]) {
  const channel = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string) {
  const [la, lb] = [luminance(parse(a)), luminance(parse(b))];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Walks up to the first opaque background so a transparent element is measured against what is really behind it.
function sample(locator: Locator): Promise<Sample> {
  return locator.first().evaluate((el) => {
    let background = "rgba(0, 0, 0, 0)";
    for (let node: Element | null = el; node; node = node.parentElement) {
      const value = getComputedStyle(node).backgroundColor;
      if (!/rgba\(.*,\s*0\)$/.test(value) && value !== "transparent") { background = value; break; }
    }
    const style = getComputedStyle(el);
    const shadow = style.boxShadow.match(/rgba?\([^)]+\)/);
    return {
      color: style.color,
      background,
      border: style.borderTopWidth !== "0px" && style.borderTopStyle !== "none" ? style.borderTopColor : shadow ? shadow[0] : "",
      backgroundImage: style.backgroundImage,
    };
  });
}

async function expectText(locator: Locator, minimum = 4.5) {
  await expect(locator.first()).toBeVisible();
  const { color, background } = await sample(locator);
  expect(contrast(color, background), `${color} sobre ${background}`).toBeGreaterThanOrEqual(minimum);
}

async function expectControl(locator: Locator) {
  await expect(locator.first()).toBeVisible();
  const { color, background, border } = await sample(locator);
  expect(border, "controle sem borda mensurável").not.toBe("");
  expect(contrast(color, background), `texto ${color} sobre ${background}`).toBeGreaterThanOrEqual(4.5);
  expect(contrast(border, background), `borda ${border} sobre ${background}`).toBeGreaterThanOrEqual(3);
}

async function expectFocus(locator: Locator) {
  await locator.first().focus();
  await expect(locator.first()).toBeFocused();
  const outline = await locator.first().evaluate(el => {
    const style = getComputedStyle(el);
    return { color: style.outlineColor, width: parseFloat(style.outlineWidth), style: style.outlineStyle };
  });
  expect(outline.width).toBeGreaterThanOrEqual(2);
  expect(outline.style).not.toBe("none");
  expect(contrast(outline.color, (await sample(locator)).background)).toBeGreaterThanOrEqual(3);
}

async function bodyBackground(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

async function visit(page: Page, path: string, scheme: Scheme) {
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
  await page.goto(path);
  const theme = page.locator("header").getByRole("button", { name: /^Tema atual:/ });
  await expect(theme).toBeEnabled();
  await theme.click();
  await theme.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
  expect(await bodyBackground(page)).toBe(PAGE_BG[scheme]);
}

test.describe("temas internos: claro e escuro", () => {
  for (const scheme of schemes) {
    test(`serviço (${scheme}): títulos, frentes, detalhe, FAQ e faixa verde`, async ({ page }) => {
      const issues = collectIssues(page);
      await visit(page, "/servicos/ciberseguranca", scheme);
      await expectText(page.getByRole("heading", { level: 1 }));
      await expectText(page.locator("#frentes li h3"));
      const frente = await sample(page.locator("#frentes > div ul > li").first());
      expect(frente.background).toBe(scheme === "light" ? "rgb(255, 255, 255)" : "rgb(29, 29, 29)");
      await expectText(page.locator("#frentes li p"));
      await page.locator("details#pentest summary").click();
      await expectText(page.locator("details#pentest h4"));
      await expectText(page.locator("details#pentest h5").first());
      await expectText(page.locator("#faq summary"));

      const band = page.locator('[data-band="cta"]');
      await band.scrollIntoViewIfNeeded();
      expect((await sample(band)).background).toBe(BAND_BG);
      await expectText(band.locator("h2"));
      await expectText(band.locator("label").filter({ hasText: "Nome" }));
      await expectControl(band.getByLabel("Nome", { exact: true }));
      await expectFocus(band.getByLabel("Nome", { exact: true }));
      const submit = await sample(band.locator('button[type="submit"]'));
      expect(submit.background).toBe("rgb(245, 245, 242)");
      expect(submit.color).toBe("rgb(0, 52, 40)");
      expect(await band.evaluate(el => getComputedStyle(el).getPropertyValue("--graphic-symbol"))).toContain("simbolo-negativo.svg");
      expect(issues).toEqual([]);
    });

    test(`ferramenta (${scheme}): rótulos, campos, seletor e resultado`, async ({ page }) => {
      const issues = collectIssues(page);
      await visit(page, "/ferramentas/rosi", scheme);
      await expectText(page.getByRole("heading", { level: 1 }));
      await expectText(page.locator("main label").first());
      await expectControl(page.locator('main input[type="text"]'));
      await expectFocus(page.locator('main input[type="text"]'));
      await expectText(page.locator("#resultado"));
      await expectText(page.locator("main details > summary").first());
      const select = page.locator("main select");
      await expect(select.first()).toBeVisible();
      await expectControl(select);
      const { backgroundImage } = await sample(select);
      expect(backgroundImage).toContain(scheme === "light" ? "%23003428" : "%23F5F5F2");
      await page.emulateMedia({ forcedColors: "active" });
      expect(await select.first().evaluate(el => ({ appearance: getComputedStyle(el).appearance, image: getComputedStyle(el).backgroundImage }))).toEqual({ appearance: "auto", image: "none" });
      await page.emulateMedia({ forcedColors: "none" });
      expect(issues).toEqual([]);
    });

    test(`newsletter (${scheme}): landing, arquivo e prévia`, async ({ page }) => {
      const issues = collectIssues(page);
      await visit(page, "/newsletter", scheme);
      await expectText(page.getByRole("heading", { level: 1 }));
      await expectText(page.locator("main label").filter({ hasText: "Seu e-mail" }));
      await expectControl(page.getByLabel("Seu e-mail", { exact: true }));
      await expectText(page.locator("article").first());
      await expectText(page.locator("main details > summary").first());

      await visit(page, "/newsletter/edicoes", scheme);
      const current = page.locator('main nav[aria-label="Filtrar por pilar"] a[aria-current="page"]');
      const { color, background } = await sample(current);
      expect(background).toBe(scheme === "light" ? "rgb(0, 52, 40)" : "rgb(245, 245, 242)");
      expect(contrast(color, background)).toBeGreaterThanOrEqual(4.5);
      await expectControl(page.locator('main nav[aria-label="Filtrar por pilar"] a:not([aria-current])'));
      await expectControl(page.locator('nav[aria-label="Paginação das prévias"] a').first());
      await expectText(page.locator('nav[aria-label="Paginação das prévias"] [aria-disabled="true"]').first(), 3);

      await visit(page, `/newsletter/edicoes/${recente.slug}`, scheme);
      await expectText(page.getByRole("heading", { level: 1 }));
      await expectText(page.getByRole("link", { name: "Voltar para todas as edições" }));
      await expectControl(page.getByLabel("Seu e-mail", { exact: true }));
      expect(issues).toEqual([]);
    });

    test(`privacidade e 404 (${scheme})`, async ({ page }) => {
      await visit(page, "/privacidade", scheme);
      await expectText(page.getByRole("heading", { level: 1 }));
      await expectText(page.getByRole("note"));
      await expectText(page.getByRole("link", { name: "contato@roottrust.com.br" }));
      await expectText(page.locator("main h2").first());
      await expect(page.getByRole("heading", { name: "Dados e finalidades" })).toBeVisible();
      await expect(page.locator("main")).toContainText("O IP também é encaminhado à Cloudflare");
      await expect(page.locator("main")).toContainText("assinaturas locais canceladas após seis meses do cancelamento");

      await page.emulateMedia({ colorScheme: scheme });
      const response = await page.goto("/rota-que-nao-existe");
      expect(response?.status()).toBe(404);
      expect(await bodyBackground(page)).toBe(PAGE_BG[scheme]);
      await expectText(page.getByRole("heading", { level: 1 }));
      await expectText(page.getByRole("link", { name: "Conhecer os serviços" }));
    });

    test(`demais serviços e ferramentas (${scheme}): superfícies e rótulos`, async ({ page }) => {
      const issues = collectIssues(page);
      for (const path of ["/servicos/infraestrutura-em-nuvem", "/servicos/desenvolvimento-de-software", "/ferramentas/shadow-ai", "/ferramentas/divida-tecnica", "/ferramentas/migracao-para-nuvem"]) {
        await visit(page, path, scheme);
        await expectText(page.getByRole("heading", { level: 1 }));
        await expectText(page.locator("main label").first());
        if (path.includes("ferramentas") && !path.endsWith("shadow-ai")) await expectControl(page.locator('main input[type="text"]'));
      }
      expect(issues).toEqual([]);
    });
  }
});
