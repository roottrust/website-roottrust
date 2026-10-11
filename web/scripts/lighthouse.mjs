// Lighthouse 13.5.0 via ephemeral `npm exec` (never added to package.json or the lockfile).
// Starts its own production server (requires `npm run build`), runs ROUNDS per route, writes
// raw reports + summary to references/audits/final-qa/lighthouse and always closes the server.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { cpus, platform, release, totalmem } from "node:os";
import { fileURLToPath } from "node:url";

const VERSION = "13.5.0";
const PORT = Number(process.env.LH_PORT ?? 3200);
const ROUNDS = Number(process.env.LH_ROUNDS ?? 3);
const ROUTES = [
  ["home", "/"],
  ["servico", "/servicos/ciberseguranca"],
  ["ferramenta", "/ferramentas/rosi"],
  ["newsletter", "/newsletter"],
];
const webRoot = fileURLToPath(new URL("..", import.meta.url));
const outDir = fileURLToPath(new URL("../../references/audits/final-qa/lighthouse", import.meta.url));
const require = createRequire(import.meta.url);
mkdirSync(outDir, { recursive: true });

const median = values => { const s = [...values].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

async function waitForServer(url, child) {
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error(`server exited early (code ${child.exitCode})`);
    try { if ((await fetch(url)).ok) return; } catch { /* not up yet */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`server did not answer at ${url}`);
}

function closeServer(child) {
  if (child.exitCode !== null) return;
  if (platform() === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGTERM");
}

const chromePath = process.env.CHROME_PATH ?? (await import("@playwright/test")).chromium.executablePath();
const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(PORT)], {
  cwd: webRoot, stdio: "ignore", env: { ...process.env, FORM_MODE: "" },
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { closeServer(server); process.exit(130); });

const runs = [];
let failure = null;
try {
  await waitForServer(`http://127.0.0.1:${PORT}/`, server);
  for (const [name, path] of ROUTES) {
    for (let round = 1; round <= ROUNDS; round++) {
      const file = join(outDir, `${name}-${round}.json`);
      const npm = platform() === "win32" ? "npm.cmd" : "npm";
      const result = spawnSync(npm, ["exec", "--yes", `--package=lighthouse@${VERSION}`, "--", "lighthouse", `http://127.0.0.1:${PORT}${path}`,
        "--output=json", `--output-path=${file}`, "--only-categories=performance", "--quiet", "--chrome-flags=--headless=new --no-sandbox"], {
        cwd: webRoot, stdio: "inherit", shell: platform() === "win32", env: { ...process.env, CHROME_PATH: chromePath },
      });
      if (result.status !== 0) throw new Error(`lighthouse failed for ${path} round ${round} (status ${result.status})`);
      const lhr = JSON.parse(readFileSync(file, "utf8"));
      if (lhr.runtimeError) throw new Error(`lighthouse runtime error for ${path}: ${lhr.runtimeError.message}`);
      const scriptBytes = lhr.audits["network-requests"].details.items.filter(i => i.resourceType === "Script").reduce((sum, i) => sum + i.transferSize, 0);
      runs.push({
        name, path, round, version: lhr.lighthouseVersion,
        lcpMs: lhr.audits["largest-contentful-paint"].numericValue,
        cls: lhr.audits["cumulative-layout-shift"].numericValue,
        tbtMs: lhr.audits["total-blocking-time"].numericValue,
        jsTransferBytes: scriptBytes,
        performanceScore: lhr.categories.performance.score,
      });
    }
  }
} catch (error) {
  failure = error;
} finally {
  closeServer(server);
}

const summary = ROUTES.map(([name, path]) => {
  const rows = runs.filter(r => r.name === name);
  return rows.length ? { name, path, rounds: rows.length, medians: {
    lcpMs: median(rows.map(r => r.lcpMs)), cls: median(rows.map(r => r.cls)), tbtMs: median(rows.map(r => r.tbtMs)), jsTransferBytes: median(rows.map(r => r.jsTransferBytes)),
  } } : { name, path, rounds: 0 };
});
const environment = { lighthouse: VERSION, node: process.version, os: `${platform()} ${release()}`, cpu: `${cpus()[0]?.model} x${cpus().length}`, memoryGiB: +(totalmem() / 2 ** 30).toFixed(1), chrome: chromePath, preset: "default (mobile emulation, simulated 4x CPU / slow-4G throttling)", server: "next start, production build, local loopback, FORM_MODE unset" };
writeFileSync(join(outDir, "summary.json"), JSON.stringify({ environment, summary, runs, error: failure ? String(failure.message ?? failure) : null }, null, 2));
console.table(summary.map(s => ({ route: s.path, rounds: s.rounds, "LCP ms": s.medians?.lcpMs?.toFixed(0), CLS: s.medians?.cls?.toFixed(3), "TBT ms": s.medians?.tbtMs?.toFixed(0), "JS KiB": s.medians ? (s.medians.jsTransferBytes / 1024).toFixed(1) : undefined })));
if (failure) { console.error(failure); process.exit(1); }
