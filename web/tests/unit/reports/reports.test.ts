import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const reportsRoot = fileURLToPath(new URL("../../../private/reports/", import.meta.url));
const srcRoot = resolve(reportsRoot, "src");
const slugs = ["rosi", "shadow-ai", "divida-tecnica", "migracao-nuvem"];
const sourceHosts = new Set(["csrc.nist.gov", "airc.nist.gov", "www.nist.gov", "sei.cmu.edu", "www.sei.cmu.edu", "docs.aws.amazon.com", "learn.microsoft.com"]);
const requiredSections = ["Método da ferramenta", "Limites", "Próximos passos", "Fontes oficiais consultadas"];

function readHtml(slug: string): string {
  return readFileSync(resolve(srcRoot, `${slug}.html`), "utf8");
}

describe.each(slugs)("relatório %s", (slug) => {
  const html = readHtml(slug);

  it("tem título, aviso genérico e as seções obrigatórias", () => {
    expect(html).toMatch(/<h1>[^<]+<\/h1>/);
    expect(html).toContain("Material genérico.");
    for (const section of requiredSections) {
      expect(html).toContain(`<h2>${section}</h2>`);
    }
  });

  it("não contém valores monetários nem a cor Sinal", () => {
    expect(html).not.toMatch(/R\$\s*\d/);
    expect(html.toUpperCase()).not.toContain("#00D63D");
  });

  it("cita apenas hosts oficiais da allowlist", () => {
    const hosts = [...html.matchAll(/https:\/\/([^/"\s<]+)/g)].map((match) => match[1]);
    expect(hosts.length).toBeGreaterThan(0);
    for (const host of hosts) {
      expect(sourceHosts.has(host), host).toBe(true);
    }
  });

  it("referencia a assinatura horizontal positiva existente", () => {
    const logo = html.match(/<img class="signature" src="([^"]+)"/);
    expect(logo).not.toBeNull();
    expect(existsSync(resolve(srcRoot, logo![1]))).toBe(true);
  });

  it("gera PDF com 2 a 3 páginas", () => {
    const pdfPath = resolve(reportsRoot, `${slug}-v1.pdf`);
    expect(existsSync(pdfPath)).toBe(true);
    const pages = (readFileSync(pdfPath, "latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
    expect(pages).toBeGreaterThanOrEqual(2);
    expect(pages).toBeLessThanOrEqual(3);
  });
});

describe("fontes da marca", () => {
  it("resolve os arquivos de fonte locais referenciados no CSS", () => {
    const css = readFileSync(resolve(srcRoot, "report.css"), "utf8");
    const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]);
    expect(urls).toHaveLength(2);
    for (const url of urls) {
      expect(existsSync(resolve(dirname(resolve(srcRoot, "report.css")), url)), url).toBe(true);
    }
  });
});
