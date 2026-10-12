import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BackupError, decryptBackup, emulatorHost, encryptBackup, restoreBackup, writeBackup } from "../../../scripts/ops/backup";
import { fakeDocuments } from "./fake";

const PASS = "correct horse battery staple";
const KDF = { kdfLogN: 14 };
const SAMPLE = {
  leads: { ld_a: { id: "ld_a", email: "ana.secreta@example.com", name: "Ana Secreta", commercialConsent: true } },
  diagnostics: { DG_1: { id: "DG_1", name: "Bruno Oculto", company: "Empresa Privada", whatsapp: "+5511999990000" } },
  jobs: { jb_1: { id: "jb_1", payload: { diagnosticId: "DG_1" } } },
};

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "rtbk-"));
});
afterEach(() => rm(dir, { recursive: true, force: true }));

describe("backup cifrado", () => {
  it("roundtrip reproduz a amostra em destino vazio", async () => {
    const path = join(dir, "b.rtbk");
    const counts = await writeBackup(fakeDocuments(SAMPLE), path, PASS, KDF);
    expect(counts).toMatchObject({ leads: 1, diagnostics: 1, jobs: 1, subscriptions: 0 });
    const target = fakeDocuments();
    expect(await restoreBackup(target, path, PASS)).toEqual({ leads: 1, diagnostics: 1, jobs: 1 });
    expect(Object.fromEntries([...target.data].map(([c, docs]) => [c, Object.fromEntries(docs)]))).toEqual(SAMPLE);
  });

  it("não deixa PII legível no arquivo nem plaintext em disco", async () => {
    const path = join(dir, "b.rtbk");
    await writeBackup(fakeDocuments(SAMPLE), path, PASS, KDF);
    const raw = (await readFile(path)).toString("latin1");
    for (const secret of ["ana.secreta", "Ana Secreta", "Bruno Oculto", "Empresa Privada", "999990000", "email", "leads"]) {
      expect(raw).not.toContain(secret);
    }
    expect(await readdir(dir)).toEqual(["b.rtbk"]);
  });

  it("nunca sobrescreve arquivo existente e exige senha forte", async () => {
    const path = join(dir, "b.rtbk");
    await writeBackup(fakeDocuments(), path, PASS, KDF);
    await expect(writeBackup(fakeDocuments(), path, PASS, KDF)).rejects.toThrow();
    await expect(writeBackup(fakeDocuments(), join(dir, "c"), "curta", KDF)).rejects.toThrow(BackupError);
  });

  it("senha errada, adulteração, truncamento e cabeçalho forjado falham sem gravar", async () => {
    const path = join(dir, "b.rtbk");
    await writeBackup(fakeDocuments(SAMPLE), path, PASS, KDF);
    const good = await readFile(path);
    const flip = (index: number, value?: number) => Buffer.from(good.map((b, i) => (i === index ? (value ?? b ^ 1) : b)));
    const cases: [string, Buffer, string][] = [
      ["senha errada", good, "uma senha totalmente diferente"],
      ["byte do corpo", flip(40), PASS],
      ["byte do cabeçalho (salt)", flip(10), PASS],
      ["truncado", good.subarray(0, good.length - 5), PASS],
      ["dado extra", Buffer.concat([good, Buffer.from([0])]), PASS],
      ["magic", flip(0, 0), PASS],
      ["KDF absurdo", flip(5, 40), PASS],
      ["vazio", Buffer.alloc(0), PASS],
    ];
    for (const [name, bytes, pass] of cases) {
      const file = join(dir, `x-${name.replace(/\W/g, "")}`);
      await writeFile(file, bytes);
      const target = fakeDocuments();
      await expect(restoreBackup(target, file, pass), name).rejects.toThrow(BackupError);
      expect(target.batches, name).toEqual([]);
    }
  });

  it("KDF: logN 18 é aceito no cabeçalho; 19 e 20 são recusados", async () => {
    const path = join(dir, "b.rtbk");
    await writeBackup(fakeDocuments(SAMPLE), path, PASS, KDF);
    const good = await readFile(path);
    for (const logN of [19, 20]) {
      const forged = Buffer.from(good);
      forged[5] = logN;
      expect(() => decryptBackup(forged, PASS), String(logN)).toThrow(/inválido/);
    }
    const eighteen = encryptBackup(Buffer.from("x"), PASS, 18);
    expect(decryptBackup(eighteen, PASS).toString()).toBe("x");
  });

  it("valida o arquivo inteiro antes de gravar (conteúdo autêntico porém inválido)", async () => {
    const head = '{"f":"rtbk","v":1}\n';
    const doc = (id: string, collection = "leads") => `{"c":"${collection}","i":"${id}","d":{}}\n`;
    const bad = [
      head + doc("a"),
      `${head}${doc("a")}{"end":1,"counts":{"leads":2}}\n`,
      `${head}${doc("a", "outra")}{"end":1,"counts":{"outra":1}}\n`,
      `${head}${doc("a/b")}{"end":1,"counts":{"leads":1}}\n`,
      `${head}${doc("a")}${doc("a")}{"end":1,"counts":{"leads":2}}\n`,
      `${head}${doc("a")}{"end":1,"counts":{"leads":1}}\n${doc("b")}`,
      `${head}${doc("a")}{"end":1,"counts":{"leads":1}}\nnao-json\n`,
    ];
    for (const [index, plaintext] of bad.entries()) {
      const file = join(dir, `v${index}`);
      await writeFile(file, encryptBackup(Buffer.from(plaintext), PASS, 14));
      const target = fakeDocuments();
      await expect(restoreBackup(target, file, PASS), plaintext).rejects.toThrow(BackupError);
      expect(target.batches).toEqual([]);
    }
  });

  it("recusa destino não vazio sem gravar nada", async () => {
    const path = join(dir, "b.rtbk");
    await writeBackup(fakeDocuments(SAMPLE), path, PASS, KDF);
    const target = fakeDocuments({ replays: { r: { id: "r" } } });
    await expect(restoreBackup(target, path, PASS)).rejects.toThrow(/não está vazio/);
    expect(target.batches).toEqual([]);
  });

  it("grava em lotes de no máximo 500", async () => {
    const leads = Object.fromEntries(Array.from({ length: 1203 }, (_, i) => [`ld_${String(i).padStart(5, "0")}`, { id: i }]));
    const path = join(dir, "b.rtbk");
    await writeBackup(fakeDocuments({ leads }), path, PASS, KDF);
    const target = fakeDocuments();
    await restoreBackup(target, path, PASS);
    expect(target.batches).toEqual([500, 500, 203]);
    expect(target.data.get("leads")?.size).toBe(1203);
  });

  it("respeita o limite de tamanho e rejeita tipos não JSON", async () => {
    await expect(writeBackup(fakeDocuments(SAMPLE), join(dir, "l"), PASS, { ...KDF, maxPlaintextBytes: 50 })).rejects.toThrow(/limite/);
    await expect(writeBackup(fakeDocuments({ leads: { a: { at: new Date() } } }), join(dir, "t"), PASS, KDF)).rejects.toThrow(/tipo não suportado/);
    expect(await readdir(dir)).toEqual([]);
  });

  it("cada arquivo usa salt e nonce novos", () => {
    const a = encryptBackup(Buffer.from("x"), PASS, 14);
    const b = encryptBackup(Buffer.from("x"), PASS, 14);
    expect(a.equals(b)).toBe(false);
    expect(decryptBackup(a, PASS).toString()).toBe("x");
  });
});

describe("guard do restore", () => {
  it.each([undefined, "", "firestore.googleapis.com:443", "10.0.0.5:8080", "localhost", "localhost:8080/x", "evil.localhost.com:8080"])(
    "recusa FIRESTORE_EMULATOR_HOST=%j",
    (host) => {
      expect(() => emulatorHost({ FIRESTORE_EMULATOR_HOST: host })).toThrow(BackupError);
    },
  );
  it.each(["localhost:8080", "127.0.0.1:9000", "[::1]:8080"])("aceita %s", (host) => {
    expect(emulatorHost({ FIRESTORE_EMULATOR_HOST: host })).toBe(host);
  });
});
