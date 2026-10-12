import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { readFile, rm, stat, writeFile } from "node:fs/promises";
import { COLLECTIONS } from "../../src/lib/server/types";
import { readCollection, type DocumentSink, type DocumentSource } from "./documents";

// File layout: MAGIC "RTBK" | version (1) | log2 scrypt N (1) | salt (16) | nonce (12) | AES-256-GCM ciphertext | tag (16).
// The whole header is authenticated as AAD. A fresh random salt gives every file its own key, so a random nonce is safe.
// Plaintext (never written to disk) is JSON lines: format line, one line per document, footer with per-collection counts.
// The backup is built and restored in memory, bounded by MAX_PLAINTEXT_BYTES; the pilot dataset is far below that.
const MAGIC = Buffer.from("RTBK");
const VERSION = 1;
const SALT_LENGTH = 16;
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;
const HEADER_LENGTH = MAGIC.length + 2 + SALT_LENGTH + NONCE_LENGTH;
const KDF_LOG_N = 17; // scrypt N=2^17, r=8, p=1 (~128 MiB, a few hundred ms)
const KDF_LOG_N_MIN = 14; // accepted range on read, so a forged header cannot demand unbounded memory
const KDF_LOG_N_MAX = 18;
export const WRITE_BATCH = 500;

export const MIN_PASSPHRASE_LENGTH = 16;
export const MAX_PLAINTEXT_BYTES = 128 * 1024 * 1024;
const LOOPBACK_EMULATOR = /^(localhost|127\.0\.0\.1|\[::1\]):\d{1,5}$/;
const FORBIDDEN_ID = /^\.{1,2}$|^__.*__$|\//;

export class BackupError extends Error {}

export type Counts = Record<string, number>;
export interface BackupEntry {
  collection: string;
  id: string;
  data: Record<string, unknown>;
}

export function requirePassphrase(passphrase: string | undefined): string {
  if (!passphrase || passphrase.length < MIN_PASSPHRASE_LENGTH) {
    throw new BackupError(`BACKUP_PASSPHRASE ausente ou com menos de ${MIN_PASSPHRASE_LENGTH} caracteres`);
  }
  return passphrase;
}

// Restore only ever talks to a local emulator; checked before any file or credential is touched.
export function emulatorHost(env: Record<string, string | undefined>): string {
  const host = env.FIRESTORE_EMULATOR_HOST?.trim() ?? "";
  if (!LOOPBACK_EMULATOR.test(host)) {
    throw new BackupError("restauração exige FIRESTORE_EMULATOR_HOST apontando para localhost; nada foi lido ou gravado");
  }
  return host;
}

function deriveKey(passphrase: string, salt: Buffer, logN: number): Buffer {
  return scryptSync(passphrase.normalize("NFKC"), salt, 32, { N: 2 ** logN, r: 8, p: 1, maxmem: 2 ** 29 });
}

export function encryptBackup(plaintext: Buffer, passphrase: string, logN = KDF_LOG_N): Buffer {
  const salt = randomBytes(SALT_LENGTH);
  const nonce = randomBytes(NONCE_LENGTH);
  const header = Buffer.concat([MAGIC, Buffer.from([VERSION, logN]), salt, nonce]);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(passphrase, salt, logN), nonce, { authTagLength: TAG_LENGTH });
  cipher.setAAD(header);
  const body = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([header, body, cipher.getAuthTag()]);
}

export function decryptBackup(file: Buffer, passphrase: string): Buffer {
  if (file.length < HEADER_LENGTH + TAG_LENGTH || !file.subarray(0, MAGIC.length).equals(MAGIC) || file[MAGIC.length] !== VERSION) {
    throw new BackupError("arquivo de backup inválido");
  }
  const logN = file[MAGIC.length + 1] ?? 0;
  if (logN < KDF_LOG_N_MIN || logN > KDF_LOG_N_MAX) throw new BackupError("arquivo de backup inválido");
  const header = file.subarray(0, HEADER_LENGTH);
  const salt = header.subarray(MAGIC.length + 2, MAGIC.length + 2 + SALT_LENGTH);
  const nonce = header.subarray(HEADER_LENGTH - NONCE_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(passphrase, salt, logN), nonce, { authTagLength: TAG_LENGTH });
  decipher.setAAD(header);
  decipher.setAuthTag(file.subarray(file.length - TAG_LENGTH));
  try {
    return Buffer.concat([decipher.update(file.subarray(HEADER_LENGTH, file.length - TAG_LENGTH)), decipher.final()]);
  } catch {
    throw new BackupError("senha incorreta ou arquivo de backup alterado");
  }
}

// Only JSON-representable values survive the round trip; anything else (Timestamp, GeoPoint, Bytes...) would be
// silently altered, so it fails the backup instead.
function assertPlain(value: unknown): void {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (Array.isArray(value)) return value.forEach(assertPlain);
  if (typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto === Object.prototype || proto === null) return Object.values(value).forEach(assertPlain);
  }
  throw new BackupError("documento com tipo não suportado pelo backup (apenas JSON)");
}

export async function writeBackup(
  source: DocumentSource,
  path: string,
  passphrase: string,
  options: { maxPlaintextBytes?: number; kdfLogN?: number } = {},
): Promise<Counts> {
  requirePassphrase(passphrase);
  const max = options.maxPlaintextBytes ?? MAX_PLAINTEXT_BYTES;
  const lines: string[] = [];
  let bytes = 0;
  const add = (value: unknown) => {
    const line = `${JSON.stringify(value)}\n`;
    bytes += Buffer.byteLength(line);
    if (bytes > max) throw new BackupError("backup excede o limite de tamanho configurado");
    lines.push(line);
  };
  const counts: Counts = {};
  add({ f: "rtbk", v: VERSION });
  for (const collection of Object.values(COLLECTIONS)) {
    counts[collection] = 0;
    for await (const document of readCollection(source, collection)) {
      assertPlain(document.data);
      add({ c: collection, i: document.id, d: document.data });
      counts[collection] += 1;
    }
  }
  add({ end: 1, counts });
  const encrypted = encryptBackup(Buffer.from(lines.join("")), passphrase, options.kdfLogN);
  try {
    await writeFile(path, encrypted, { flag: "wx", mode: 0o600 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") await rm(path, { force: true });
    throw error;
  }
  return counts;
}

function parseLine(line: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(line);
    if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {
    // Reported below without echoing the line: it may contain personal data.
  }
  throw new BackupError("linha inválida no backup");
}

// Validates the entire plaintext (format, collections, IDs, duplicates, footer counts) and returns the documents.
export function parseBackup(plaintext: Buffer): { entries: BackupEntry[]; counts: Counts } {
  const known = new Set<string>(Object.values(COLLECTIONS));
  const lines = plaintext.toString("utf8").split("\n");
  if (lines.pop() !== "") throw new BackupError("backup incompleto");
  const header = parseLine(lines.shift() ?? "");
  if (header.f !== "rtbk" || header.v !== VERSION) throw new BackupError("arquivo de backup inválido");
  const entries: BackupEntry[] = [];
  const counts: Counts = {};
  const seen = new Set<string>();
  let footer: Record<string, unknown> | undefined;
  for (const line of lines) {
    if (footer) throw new BackupError("dados após o rodapé do backup");
    const value = parseLine(line);
    if ("end" in value) {
      footer = value;
      continue;
    }
    const { c: collection, i: id, d: data } = value;
    if (typeof collection !== "string" || !known.has(collection)) throw new BackupError("coleção desconhecida no backup");
    if (typeof id !== "string" || !id || Buffer.byteLength(id) > 1500 || FORBIDDEN_ID.test(id)) throw new BackupError("ID inválido no backup");
    if (typeof data !== "object" || data === null || Array.isArray(data)) throw new BackupError("documento inválido no backup");
    if (seen.has(`${collection}/${id}`)) throw new BackupError("documento duplicado no backup");
    seen.add(`${collection}/${id}`);
    counts[collection] = (counts[collection] ?? 0) + 1;
    entries.push({ collection, id, data: data as Record<string, unknown> });
  }
  const expected = footer?.counts;
  if (!footer || typeof expected !== "object" || expected === null) throw new BackupError("backup incompleto");
  const declared = expected as Record<string, unknown>;
  const names = new Set([...Object.keys(declared), ...Object.keys(counts)]);
  if ([...names].some((name) => (declared[name] ?? 0) !== (counts[name] ?? 0))) throw new BackupError("contagem do backup não confere");
  return { entries, counts };
}

// Order: decrypt + validate everything, require an empty target, only then write (batches of <= 500, never overwriting).
export async function restoreBackup(target: DocumentSource & DocumentSink, path: string, passphrase: string): Promise<Counts> {
  requirePassphrase(passphrase);
  if ((await stat(path)).size > MAX_PLAINTEXT_BYTES + HEADER_LENGTH + TAG_LENGTH) throw new BackupError("arquivo de backup acima do limite");
  const { entries, counts } = parseBackup(decryptBackup(await readFile(path), passphrase));
  for (const collection of Object.values(COLLECTIONS)) {
    if ((await target.page(collection, undefined, 1)).length > 0) {
      throw new BackupError(`destino não está vazio (${collection}); restauração recusada`);
    }
  }
  for (let start = 0; start < entries.length; start += WRITE_BATCH) {
    await target.writeAll(entries.slice(start, start + WRITE_BATCH));
  }
  return counts;
}
