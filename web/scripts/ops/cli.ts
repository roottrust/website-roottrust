import { applicationDefault, cert, getApp, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { realpath, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { withdrawCommercialConsent } from "../../src/lib/server/repository";
import { createFirestoreStore, type FirestoreLike, type Store } from "../../src/lib/server/store";
import { COLLECTIONS, type DiagnosticRecord, type LeadRecord } from "../../src/lib/server/types";
import { BackupError, emulatorHost, requirePassphrase, restoreBackup, writeBackup } from "./backup";
import { toCsv } from "./csv";
import { adminDocuments, readCollection, type DocumentSink, type DocumentSource } from "./documents";

export const REPO_ROOT = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
export const SAFE_OUTPUT_DIR = resolve(REPO_ROOT, "web", "ops-data");
export const RESTORE_PROJECT_ID = "demo-roottrust-restore";
export const MAX_EXPORT_ROWS = 50_000;

export const USAGE = `Comandos operacionais locais (nenhum é exposto pelo site):
  export-commercial --out ARQUIVO.csv     leads com e-mail e consentimento comercial atual
  export-diagnostics --out ARQUIVO.csv    pedidos de diagnóstico (arquivo separado, sem relação com marketing)
  withdraw-consent E-MAIL                 retira o consentimento comercial (exige DATA_ID_SECRET)
  backup --out ARQUIVO.rtbk               backup cifrado (exige BACKUP_PASSPHRASE)
  restore --in ARQUIVO.rtbk               restaura SOMENTE em emulador local (FIRESTORE_EMULATOR_HOST=localhost:PORTA)
  help
Credenciais: FIREBASE_SERVICE_ACCOUNT_JSON ou credenciais padrão do Google. Veja docs/web/development.md.
`;

export interface CliDeps {
  env: Record<string, string | undefined>;
  now: () => Date;
  log: (line: string) => void;
  source: () => DocumentSource;
  store: () => Store;
  // Receives the already validated loopback emulator host.
  restoreTarget: (host: string) => DocumentSource & DocumentSink;
}

// Files with personal data may only be created under the git-ignored web/ops-data/ or outside the repository.
// The parent directory is resolved with realpath so symlinks/junctions cannot smuggle the file into the repo;
// it must already exist (this command never creates directories).
export async function checkOutputPath(path: string, repoRoot = REPO_ROOT, safeDir = SAFE_OUTPUT_DIR): Promise<string> {
  const absolute = resolve(path);
  let parent: string;
  let realRepo: string;
  try {
    parent = await realpath(dirname(absolute));
    realRepo = await realpath(repoRoot);
  } catch {
    throw new BackupError("diretório de saída inexistente: crie-o antes (web/ops-data/ ou um diretório fora do repositório)");
  }
  const target = join(parent, basename(absolute));
  const inside = (base: string) => {
    const rel = relative(base, target);
    return rel !== "" && rel.split(sep)[0] !== ".." && !isAbsolute(rel);
  };
  if (inside(realRepo) && !inside(join(realRepo, relative(repoRoot, safeDir)))) {
    throw new BackupError("arquivo de saída dentro do repositório: use web/ops-data/ (ignorado pelo Git) ou um caminho fora dele");
  }
  return target;
}

function flag(args: readonly string[], name: string): string {
  const index = args.indexOf(name);
  const value = args[index + 1];
  if (index === -1 || !value || value.startsWith("--") || args.length !== 2) throw new BackupError(`uso: ${name} ARQUIVO`);
  return value;
}

async function collect<T>(source: DocumentSource, collection: string, accept: (data: Record<string, unknown>) => T | undefined): Promise<T[]> {
  const rows: T[] = [];
  for await (const document of readCollection(source, collection)) {
    const row = accept(document.data);
    if (row === undefined) continue;
    if (rows.length >= MAX_EXPORT_ROWS) throw new BackupError(`exportação acima de ${MAX_EXPORT_ROWS} linhas; nada foi gravado`);
    rows.push(row);
  }
  return rows;
}

const text = (value: unknown): string => (typeof value === "string" ? value : "");

export async function exportCommercial(source: DocumentSource, path: string): Promise<number> {
  // Strictly `true` plus a non-empty e-mail: absence, "true" strings or withdrawn consent never qualify.
  const rows = await collect(source, COLLECTIONS.leads, (data) => {
    const lead = data as Partial<LeadRecord>;
    const email = text(lead.email).trim();
    if (lead.commercialConsent !== true || !email) return undefined;
    return [email, text(lead.name), text(lead.company), text(lead.commercialConsentAt), text(lead.commercialConsentOrigin)];
  });
  await writeFile(path, toCsv(["email", "nome", "empresa", "consentimento_em", "origem_do_consentimento"], rows), { flag: "wx", mode: 0o600 });
  return rows.length;
}

export async function exportDiagnostics(source: DocumentSource, path: string): Promise<number> {
  const rows = await collect(source, COLLECTIONS.diagnostics, (data) => {
    const record = data as Partial<DiagnosticRecord>;
    return [text(record.id), text(record.name), text(record.company), text(record.whatsapp), text(record.createdAt), text(record.notifiedAt)];
  });
  await writeFile(path, toCsv(["id", "nome", "empresa", "whatsapp", "criado_em", "notificado_em"], rows), { flag: "wx", mode: 0o600 });
  return rows.length;
}

// Returns the exit code. Messages never include document contents or e-mail addresses.
export async function runCli(argv: readonly string[], deps: CliDeps): Promise<number> {
  const [command, ...args] = argv;
  try {
    switch (command) {
      case "export-commercial":
        deps.log(`${await exportCommercial(deps.source(), await checkOutputPath(flag(args, "--out")))} leads exportados`);
        return 0;
      case "export-diagnostics":
        deps.log(`${await exportDiagnostics(deps.source(), await checkOutputPath(flag(args, "--out")))} diagnósticos exportados`);
        return 0;
      case "withdraw-consent": {
        const [email] = args;
        const secret = deps.env.DATA_ID_SECRET;
        if (!email || args.length !== 1) throw new BackupError("uso: withdraw-consent E-MAIL");
        if (!secret) throw new BackupError("DATA_ID_SECRET ausente");
        deps.log(`resultado: ${await withdrawCommercialConsent(deps.store(), secret, email, deps.now())}`);
        return 0;
      }
      case "backup": {
        const counts = await writeBackup(deps.source(), await checkOutputPath(flag(args, "--out")), requirePassphrase(deps.env.BACKUP_PASSPHRASE));
        deps.log(`backup cifrado gravado: ${JSON.stringify(counts)}`);
        return 0;
      }
      case "restore": {
        const host = emulatorHost(deps.env);
        const path = resolve(flag(args, "--in"));
        const passphrase = requirePassphrase(deps.env.BACKUP_PASSPHRASE);
        const counts = await restoreBackup(deps.restoreTarget(host), path, passphrase);
        deps.log(`restaurado no emulador ${host}: ${JSON.stringify(counts)}`);
        return 0;
      }
      case undefined:
      case "help":
      case "--help":
        deps.log(USAGE);
        return command === undefined ? 1 : 0;
      default:
        deps.log(`comando desconhecido\n${USAGE}`);
        return 1;
    }
  } catch (error) {
    // Only our own messages are printed; foreign errors (SDK, fs) may embed paths or document data.
    deps.log(`erro: ${error instanceof BackupError ? error.message : error instanceof Error ? String((error as { code?: unknown }).code ?? error.name) : "falha inesperada"}`);
    return 1;
  }
}

function realFirestore(env: Record<string, string | undefined>) {
  const account = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credential = account ? cert(JSON.parse(account) as ServiceAccount) : applicationDefault();
  return getFirestore(getApps().length ? getApp() : initializeApp({ credential }));
}

const defaultDeps: CliDeps = {
  env: process.env,
  now: () => new Date(),
  log: (line) => console.log(line),
  source: () => adminDocuments(realFirestore(process.env)),
  store: () => createFirestoreStore(realFirestore(process.env) as unknown as FirestoreLike),
  // Dedicated app on a demo project id with no explicit credential; FIRESTORE_EMULATOR_HOST (validated as loopback) routes it to the emulator, never to the pilot project.
  restoreTarget: () => adminDocuments(getFirestore(initializeApp({ projectId: RESTORE_PROJECT_ID }, "restore"))),
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runCli(process.argv.slice(2), defaultDeps);
}
