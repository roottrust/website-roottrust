import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const reportsRoot = fileURLToPath(new URL("../../../private/reports/", import.meta.url));
const srcRoot = resolve(reportsRoot, "src");
const slugs = ["rosi", "shadow-ai", "divida-tecnica", "migracao-nuvem"];
const sourceHosts = new Set(["csrc.nist.gov", "airc.nist.gov", "www.nist.gov", "sei.cmu.edu", "www.sei.cmu.edu", "docs.aws.amazon.com", "learn.microsoft.com"]);
const requiredSections = ["Método da ferramenta", "Limites", "Próximos passos", "Perguntas de revisão", "Ações por tema", "Fontes consultadas"];

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

  it("abre Próximos passos em nova página e evita partir itens", () => {
    expect(html).toContain('<section class="next">');
    const css = readFileSync(resolve(srcRoot, "report.css"), "utf8");
    expect(css).toMatch(/section\.next\s*{\s*break-before:\s*page/);
    expect(css).toMatch(/li,\s*h2\s*{\s*break-inside:\s*avoid/);
  });

  it("tem 5–6 perguntas e 3–4 ações, CTA com formulário e e-mail, sem IDs Fxx", () => {
    const list = (title: string) => {
      const start = html.indexOf(`<h2>${title}</h2>`);
      const m = html.slice(start).match(/<ul>([\s\S]*?)<\/ul>/);
      return m ? (m[1].match(/<li>/g) ?? []).length : 0;
    };
    expect(list("Perguntas de revisão")).toBeGreaterThanOrEqual(5);
    expect(list("Perguntas de revisão")).toBeLessThanOrEqual(6);
    expect(list("Ações por tema")).toBeGreaterThanOrEqual(3);
    expect(list("Ações por tema")).toBeLessThanOrEqual(4);
    expect(html).toContain("Nome, Empresa e WhatsApp");
    expect(html).toContain("contato@roottrust.com.br");
    expect(html).not.toMatch(/\bF\d{2}\b/);
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

describe("rodapé e README", () => {
  it("usa rodapé de pelo menos 8pt", () => {
    const render = readFileSync(fileURLToPath(new URL("../../../scripts/reports/render.mjs", import.meta.url)), "utf8");
    expect(render).toMatch(/font-size:\s*8pt/);
  });

  it("documenta procedência do logo, OFL e comando de geração", () => {
    const readme = readFileSync(resolve(reportsRoot, "README.md"), "utf8");
    expect(readme).toContain("OFL");
    expect(readme).toContain("roottrust-horizontal-positivo.svg");
    expect(readme).toContain("node scripts/reports/render.mjs");
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
