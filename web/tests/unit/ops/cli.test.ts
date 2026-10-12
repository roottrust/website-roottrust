import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkOutputPath, runCli, type CliDeps } from "../../../scripts/ops/cli";
import { opaqueId } from "../../../src/lib/server/ids";
import { createMemoryStore } from "../../../src/lib/server/store";
import { fakeDocuments } from "./fake";

const PASS = "correct horse battery staple";
const SECRET = "s".repeat(32);
const web = resolve(import.meta.dirname, "../../..");

const LEADS = {
  l1: { email: "ok@example.com", name: "=cmd|' /C calc'!A0", company: 'Acme, "Inc"', commercialConsent: true, commercialConsentAt: "2026-10-01T00:00:00.000Z", commercialConsentOrigin: "relatorio:rosi" },
  l2: { email: "optout@example.com", name: "Sem consentimento", commercialConsent: false },
  l3: { email: "retirado@example.com", commercialConsent: false, commercialConsentWithdrawnAt: "2026-10-02T00:00:00.000Z" },
  l4: { name: "Sem email", whatsapp: "+5511999990000", commercialConsent: true },
  l5: { email: "string@example.com", commercialConsent: "true" },
  l6: { email: "ausente@example.com" },
};
const DIAGNOSTICS = { DG_1: { id: "DG_1", name: "Bruno", company: "Beta", whatsapp: "+5511988887777", createdAt: "2026-10-03T00:00:00.000Z" } };

let dir: string;
let logs: string[];
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "rtcli-"));
  logs = [];
});
afterEach(() => rm(dir, { recursive: true, force: true }));

function deps(over: Partial<CliDeps> = {}): CliDeps {
  const docs = fakeDocuments({ leads: LEADS, diagnostics: DIAGNOSTICS });
  return {
    env: { BACKUP_PASSPHRASE: PASS, DATA_ID_SECRET: SECRET },
    now: () => new Date("2026-10-12T12:00:00.000Z"),
    log: (line) => void logs.push(line),
    source: () => docs,
    store: () => createMemoryStore(),
    restoreTarget: () => fakeDocuments(),
    ...over,
  };
}

describe("exportações CSV", () => {
  it("comercial: só e-mail + consentimento true, células neutralizadas, sem WhatsApp", async () => {
    const out = join(dir, "c.csv");
    expect(await runCli(["export-commercial", "--out", out], deps())).toBe(0);
    const csv = await readFile(out, "utf8");
    expect(csv).toContain("ok@example.com");
    expect(csv).toContain(`"'=cmd|' /C calc'!A0"`);
    expect(csv).toContain('"Acme, ""Inc"""');
    for (const absent of ["optout", "retirado", "Sem email", "string@", "ausente@", "5511999990000", "Bruno"]) expect(csv).not.toContain(absent);
    expect(csv.split("\r\n").filter(Boolean)).toHaveLength(2);
  });

  it("diagnóstico sai em arquivo separado e não inclui leads", async () => {
    const out = join(dir, "d.csv");
    expect(await runCli(["export-diagnostics", "--out", out], deps())).toBe(0);
    const csv = await readFile(out, "utf8");
    expect(csv).toContain("Bruno");
    expect(csv).not.toContain("ok@example.com");
  });

  it("não sobrescreve arquivo existente e recusa saída dentro do repositório", async () => {
    const out = join(dir, "c.csv");
    await writeFile(out, "x");
    expect(await runCli(["export-commercial", "--out", out], deps())).toBe(1);
    expect(await readFile(out, "utf8")).toBe("x");
    expect(await runCli(["export-commercial", "--out", join(web, "src", "leak.csv")], deps())).toBe(1);
    expect(logs.at(-1)).toMatch(/dentro do repositório/);
  });

  describe("checkOutputPath", () => {
    let repo: string;
    let safe: string;
    beforeEach(async () => {
      repo = join(dir, "repo");
      safe = join(repo, "web", "ops-data");
      await mkdir(safe, { recursive: true });
      await mkdir(join(repo, "web", "src"));
      await mkdir(join(repo, "..x"));
      await mkdir(join(dir, "fora"));
    });
    const check = (p: string) => checkOutputPath(p, repo, safe);

    it("aceita ops-data e fora do repositório; recusa o resto do repositório", async () => {
      expect(await check(join(safe, "a.csv"))).toBe(join(safe, "a.csv"));
      expect(await check(join(dir, "fora", "a.csv"))).toBe(join(dir, "fora", "a.csv"));
      await expect(check(join(repo, "web", "src", "a.csv"))).rejects.toThrow(/dentro do repositório/);
      await expect(check(join(safe, "..", "a.csv"))).rejects.toThrow(/dentro do repositório/);
      await expect(check(join(repo, "a.csv"))).rejects.toThrow(/dentro do repositório/);
    });

    it("trata '..x' como nome dentro do repositório, não como saída", async () => {
      await expect(check(join(repo, "..x", "a.csv"))).rejects.toThrow(/dentro do repositório/);
    });

    it("falha de forma segura se o diretório pai não existe", async () => {
      await expect(check(join(safe, "nova", "a.csv"))).rejects.toThrow(/inexistente/);
    });

    it("segue symlink/junction do pai e recusa destino real dentro do repositório", async (ctx) => {
      const link = join(dir, "fora", "link");
      try {
        await symlink(join(repo, "web", "src"), link, "junction");
      } catch {
        ctx.skip();
      }
      await expect(check(join(link, "a.csv"))).rejects.toThrow(/dentro do repositório/);
      const toSafe = join(dir, "fora", "linksafe");
      await symlink(safe, toSafe, "junction");
      expect(await check(join(toSafe, "a.csv"))).toBe(join(safe, "a.csv"));
    });
  });
});

describe("retirada de consentimento", () => {
  it("chama withdrawCommercialConsent e não imprime o e-mail", async () => {
    const store = createMemoryStore();
    const id = opaqueId(SECRET, "ld", "email:ok@example.com");
    await store.transaction(async (tx) => tx.set("leads", id, { id, email: "ok@example.com", commercialConsent: true, origins: [] }));
    expect(await runCli(["withdraw-consent", "OK@example.com"], deps({ store: () => store }))).toBe(0);
    expect(logs).toEqual(["resultado: withdrawn"]);
    expect(store.dump("leads")[id]).toMatchObject({ commercialConsent: false });
    expect(await runCli(["withdraw-consent", "ok@example.com"], deps({ store: () => store }))).toBe(0);
    expect(logs.at(-1)).toBe("resultado: no_consent");
  });

  it("exige segredo e argumento", async () => {
    expect(await runCli(["withdraw-consent", "a@b.co"], deps({ env: {} }))).toBe(1);
    expect(await runCli(["withdraw-consent"], deps())).toBe(1);
  });
});

describe("backup e restore pela CLI", () => {
  it("roundtrip; restore exige emulador local antes de tocar o destino", async () => {
    const out = join(dir, "b.rtbk");
    expect(await runCli(["backup", "--out", out], deps())).toBe(0);
    const restoreTarget = vi.fn(() => fakeDocuments());
    expect(await runCli(["restore", "--in", out], deps({ restoreTarget }))).toBe(1);
    const remote = { BACKUP_PASSPHRASE: PASS, FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:443" };
    expect(await runCli(["restore", "--in", out], deps({ restoreTarget, env: remote }))).toBe(1);
    expect(restoreTarget).not.toHaveBeenCalled();
    const target = fakeDocuments();
    const local = { BACKUP_PASSPHRASE: PASS, FIRESTORE_EMULATOR_HOST: "localhost:8080" };
    expect(await runCli(["restore", "--in", out], deps({ restoreTarget: () => target, env: local }))).toBe(0);
    expect(target.data.get("leads")?.size).toBe(6);
    expect(logs.join("\n")).not.toContain("example.com");
  });

  it("sem passphrase o destino não é aberto", async () => {
    const restoreTarget = vi.fn(() => fakeDocuments());
    expect(await runCli(["restore", "--in", "x"], deps({ restoreTarget, env: { FIRESTORE_EMULATOR_HOST: "localhost:8080" } }))).toBe(1);
    expect(restoreTarget).not.toHaveBeenCalled();
  });
});

describe("processo real", () => {
  const run = (...args: string[]) =>
    spawnSync(process.execPath, ["--import", "./scripts/ops/register.mjs", "scripts/ops/cli.ts", ...args], {
      cwd: web,
      encoding: "utf8",
      env: { PATH: process.env.PATH ?? "", SystemRoot: process.env.SystemRoot ?? "" } as unknown as NodeJS.ProcessEnv,
    });

  it("importa sem erro e mostra a ajuda", () => {
    const result = run("help");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("export-commercial");
  });

  it("restore sem FIRESTORE_EMULATOR_HOST falha antes de qualquer acesso", () => {
    const result = run("restore", "--in", "inexistente.rtbk");
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("FIRESTORE_EMULATOR_HOST");
  });

  it("comando desconhecido retorna 1", () => {
    expect(run("nope").status).toBe(1);
  });
});
