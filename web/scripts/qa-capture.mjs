// Captures native routes vs approved exports into references/audits/final-qa/captures.
// Requires `npm run build`. Playwright starts and stops its own production servers.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");
const result = spawnSync(process.execPath, [cli, "test", "tests/e2e/qa-capture.spec.ts", "--project=chromium-desktop", "--project=chromium-mobile", ...process.argv.slice(2)], {
  cwd: webRoot,
  stdio: "inherit",
  env: { ...process.env, QA_CAPTURE: "1" },
});
process.exit(result.status ?? 1);
