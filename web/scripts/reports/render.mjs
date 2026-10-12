// Renders private A4 reports from web/private/reports/src/*.html into *-v1.pdf.
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const reportsRoot = fileURLToPath(new URL("../../private/reports/", import.meta.url));
const srcDir = join(reportsRoot, "src");

const footerTemplate = `
<div style="width:100%; font-family: Archivo, sans-serif; font-size:7pt; color:#2E2E2E; padding:0 16mm; display:flex; justify-content:space-between;">
  <span>Root Trust · Relatório padrão · v1</span>
  <span>página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
</div>`;

const sources = (await readdir(srcDir)).filter((name) => name.endsWith(".html")).sort();
const browser = await chromium.launch({ headless: true });

try {
  for (const file of sources) {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(join(srcDir, file)).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const outputName = `${basename(file, ".html")}-v1.pdf`;
    await page.pdf({
      path: join(reportsRoot, outputName),
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate,
      margin: { top: "14mm", bottom: "16mm", left: "16mm", right: "16mm" },
    });
    await page.close();
    console.log(`gerado: ${outputName}`);
  }
} finally {
  await browser.close();
}
