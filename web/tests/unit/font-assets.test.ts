import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

interface FontFace { characterSet: number[]; variationAxes: Record<string, { min: number; max: number; default: number }> }
const parseFont = createRequire(import.meta.url)("next/dist/compiled/@next/font/dist/fontkit").default as (buffer: Buffer) => FontFace;

const fontsDir = join(__dirname, "../../src/assets/fonts");
const srcDir = join(__dirname, "../../src");
const audit = JSON.parse(readFileSync(join(__dirname, "../../../references/audits/font-optimization.json"), "utf8")) as { fonts: Array<{ ttf: string; woff2: string; sha256: string; bytes: number; version: string; axes: Record<string, [number, number]> }> };

function sourceCodePoints(dir: string, found = new Set<number>()): Set<number> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) sourceCodePoints(path, found);
    else if (/\.(tsx?|css|json|md)$/.test(name)) for (const char of readFileSync(path, "utf8")) found.add(char.codePointAt(0)!);
  }
  return found;
}

describe("optimized Latin WOFF2 fonts", () => {
  const used = sourceCodePoints(srcDir);
  for (const entry of audit.fonts) {
    const original = parseFont(readFileSync(join(fontsDir, entry.ttf)));
    const bytes = readFileSync(join(fontsDir, entry.woff2));
    const optimized = parseFont(bytes);

    it(`${entry.woff2} matches the audited hash and size`, () => {
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sha256);
      expect(bytes.length).toBe(entry.bytes);
    });
    it(`${entry.woff2} keeps the weight axis and a fixed default width`, () => {
      for (const [axis, [min, max]] of Object.entries(entry.axes)) expect(optimized.variationAxes[axis]).toMatchObject({ min, max });
      expect(Object.keys(optimized.variationAxes).sort()).toEqual(Object.keys(entry.axes).sort());
      expect(optimized.variationAxes.wght.default).toBe(original.variationAxes.wght.default);
    });
    it(`${entry.woff2} covers every source character the original TTF supports`, () => {
      const originalSet = new Set(original.characterSet);
      const optimizedSet = new Set(optimized.characterSet);
      const lost = [...used].filter((cp) => originalSet.has(cp) && !optimizedSet.has(cp)).map((cp) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`);
      expect(lost).toEqual([]);
    });
  }
});
