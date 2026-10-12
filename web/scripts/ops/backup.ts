import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { open, rm, type FileHandle } from "node:fs/promises";
import { COLLECTIONS } from "../../src/lib/server/types";
import { readCollection, type DocumentSink, type DocumentSource } from "./documents";

// Layout: header (magic, version, salt, base IV) then frames (u32 length, u8 flags, ciphertext, GCM tag).
// Each frame's AAD binds the header, its index and its final flag, so edits, reordering, truncation and
// trailing data all fail authentication. Plaintext is JSON lines: format line, one line per document, footer with counts.
const MAGIC = Buffer.from("RTBK");
const VERSION = 1;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const HEADER_LENGTH = MAGIC.length + 1 + SALT_LENGTH + IV_LENGTH;
const FRAME_SIZE = 64 * 1024;
const FRAME_HEAD_LENGTH = 5;
const TAG_LENGTH = 16;
const FLAG_FINAL = 1;
const WRITE_BATCH = 400;
const SCRYPT = { N: 2 ** 17, r: 8, p: 1, maxmem: 2 ** 28 };

export const MIN_PASSPHRASE_LENGTH = 16;
export const DEFAULT_MAX_PLAINTEXT_BYTES = 512 * 1024 * 1024;
const LOOPBACK_EMULATOR = /^(localhost|127\.0\.0\.1|\[::1\]):\d{1,5}$/;

export class BackupError extends Error {}

export type Counts = Record<string, number>;

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

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, 32, SCRYPT);
}

function frameNonce(iv: Buffer, index: number): Buffer {
  const nonce = Buffer.from(iv);
  nonce.writeBigUInt64BE(nonce.readBigUInt64BE(4) ^ BigInt(index), 4);
  return nonce;
}

function frameAad(header: Buffer, index: number, flags: number): Buffer {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(index));
  return Buffer.concat([header, counter, Buffer.from([flags])]);
}

function encryptFrame(key: Buffer, header: Buffer, iv: Buffer, index: number, flags: number, plaintext: Buffer): Buffer {
  const cipher = createCipheriv("aes-256-gcm", key, frameNonce(iv, index), { authTagLength: TAG_LENGTH });
  cipher.setAAD(frameAad(header, index, flags));
  const body = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const head = Buffer.alloc(FRAME_HEAD_LENGTH);
  head.writeUInt32BE(body.length);
  head[4] = flags;
  return Buffer.concat([head, body, cipher.getAuthTag()]);
}

function decryptFrame(key: Buffer, header: Buffer, iv: Buffer, index: number, flags: number, body: Buffer): Buffer {
  const ciphertext = body.subarray(0, body.length - TAG_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", key, frameNonce(iv, index), { authTagLength: TAG_LENGTH });
  decipher.setAAD(frameAad(header, index, flags));
  decipher.setAuthTag(body.subarray(body.length - TAG_LENGTH));
  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new BackupError("senha incorreta ou arquivo de backup alterado");
  }
}

async function readExact(handle: FileHandle, position: number, length: number): Promise<Buffer> {
  const buffer = Buffer.alloc(length);
  const { bytesRead } = await handle.read(buffer, 0, length, position);
  if (bytesRead !== length) throw new BackupError("backup truncado");
  return buffer;
}

// Frames are authenticated one by one; the caller sees plaintext of a frame only after its tag verified.
async function forEachFrame(path: string, passphrase: string, onPlaintext: (chunk: Buffer) => Promise<void>): Promise<void> {
  const handle = await open(path, "r");
  try {
    const { size } = await handle.stat();
    if (size < HEADER_LENGTH) throw new BackupError("arquivo de backup inválido");
    const header = await readExact(handle, 0, HEADER_LENGTH);
    if (!header.subarray(0, MAGIC.length).equals(MAGIC) || header[MAGIC.length] !== VERSION) {
      throw new BackupError("arquivo de backup inválido");
    }
    const salt = header.subarray(MAGIC.length + 1, MAGIC.length + 1 + SALT_LENGTH);
    const iv = header.subarray(MAGIC.length + 1 + SALT_LENGTH);
    const key = deriveKey(passphrase, salt);
    let position = HEADER_LENGTH;
    for (let index = 0; ; index += 1) {
      if (position + FRAME_HEAD_LENGTH > size) throw new BackupError("backup truncado");
      const head = await readExact(handle, position, FRAME_HEAD_LENGTH);
      const length = head.readUInt32BE(0);
      const flags = head[4] ?? 0;
      if (length > FRAME_SIZE || (flags & ~FLAG_FINAL) !== 0) throw new BackupError("arquivo de backup inválido");
      const frameEnd = position + FRAME_HEAD_LENGTH + length + TAG_LENGTH;
      if (frameEnd > size) throw new BackupError("backup truncado");
      const body = await readExact(handle, position + FRAME_HEAD_LENGTH, length + TAG_LENGTH);
      await onPlaintext(decryptFrame(key, header, iv, index, flags, body));
      position = frameEnd;
      if (flags & FLAG_FINAL) {
        if (position !== size) throw new BackupError("dados após o último quadro");
        return;
      }
    }
  } finally {
    await handle.close();
  }
}

class PlaintextWriter {
  private pending: Buffer[] = [];
  private pendingSize = 0;
  private index = 0;
  private total = 0;

  constructor(
    private readonly handle: FileHandle,
    private readonly key: Buffer,
    private readonly header: Buffer,
    private readonly iv: Buffer,
    private readonly maxBytes: number,
  ) {}

  async line(value: unknown): Promise<void> {
    const bytes = Buffer.from(`${JSON.stringify(value)}\n`);
    this.total += bytes.length;
    if (this.total > this.maxBytes) throw new BackupError("backup excede o limite de tamanho configurado");
    this.pending.push(bytes);
    this.pendingSize += bytes.length;
    while (this.pendingSize >= FRAME_SIZE) {
      const all = Buffer.concat(this.pending);
      await this.emit(all.subarray(0, FRAME_SIZE), 0);
      const rest = all.subarray(FRAME_SIZE);
      this.pending = [rest];
      this.pendingSize = rest.length;
    }
  }

  async finish(): Promise<void> {
    await this.emit(Buffer.concat(this.pending), FLAG_FINAL);
  }

  private async emit(plaintext: Buffer, flags: number): Promise<void> {
    const frame = encryptFrame(this.key, this.header, this.iv, this.index, flags, plaintext);
    this.index += 1;
    await this.handle.writeFile(frame);
  }
}

export async function writeBackup(
  source: DocumentSource,
  path: string,
  passphrase: string,
  maxPlaintextBytes = DEFAULT_MAX_PLAINTEXT_BYTES,
): Promise<Counts> {
  requirePassphrase(passphrase);
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const header = Buffer.concat([MAGIC, Buffer.from([VERSION]), salt, iv]);
  const key = deriveKey(passphrase, salt);
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.writeFile(header);
    const writer = new PlaintextWriter(handle, key, header, iv, maxPlaintextBytes);
    const counts: Counts = {};
    await writer.line({ f: "rtbk", v: VERSION });
    for (const collection of Object.values(COLLECTIONS)) {
      counts[collection] = 0;
      for await (const document of readCollection(source, collection)) {
        await writer.line({ c: collection, i: document.id, d: document.data });
        counts[collection] += 1;
      }
    }
    await writer.line({ end: 1, counts });
    await writer.finish();
    return counts;
  } catch (error) {
    await handle.close();
    await rm(path, { force: true });
    throw error;
  }
  finally {
    await handle.close().catch(() => undefined);
  }
}

// Validates the whole structure of the plaintext and applies documents in order.
class BackupParser {
  private remainder = Buffer.alloc(0);
  private lines = 0;
  private counts: Counts = {};
  private ended = false;

  constructor(private readonly onDocument: (collection: string, id: string, data: Record<string, unknown>) => Promise<void>) {}

  async feed(chunk: Buffer): Promise<void> {
    let buffer = Buffer.concat([this.remainder, chunk]);
    let newline = buffer.indexOf(0x0a);
    while (newline !== -1) {
      await this.handle(buffer.subarray(0, newline).toString("utf8"));
      buffer = buffer.subarray(newline + 1);
      newline = buffer.indexOf(0x0a);
    }
    this.remainder = buffer;
  }

  async end(): Promise<Counts> {
    if (this.remainder.length > 0 || !this.ended) throw new BackupError("backup incompleto");
    return this.counts;
  }

  private async handle(line: string): Promise<void> {
    if (this.ended) throw new BackupError("dados após o rodapé do backup");
    const value = parseLine(line);
    if (this.lines === 0) {
      if (value.f !== "rtbk" || value.v !== VERSION) throw new BackupError("arquivo de backup inválido");
    } else if ("end" in value) {
      if (!isCounts(value.counts, this.counts)) throw new BackupError("contagem do backup não confere");
      this.ended = true;
    } else {
      const collection = value.c;
      if (typeof collection !== "string" || !Object.values(COLLECTIONS).includes(collection as never)) {
        throw new BackupError("coleção desconhecida no backup");
      }
      if (typeof value.i !== "string" || typeof value.d !== "object" || value.d === null || Array.isArray(value.d)) {
        throw new BackupError("documento inválido no backup");
      }
      this.counts[collection] = (this.counts[collection] ?? 0) + 1;
      await this.onDocument(collection, value.i, value.d as Record<string, unknown>);
    }
    this.lines += 1;
  }
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

function isCounts(value: unknown, observed: Counts): boolean {
  if (typeof value !== "object" || value === null) return false;
  const expected = value as Record<string, unknown>;
  const keys = new Set([...Object.keys(expected), ...Object.keys(observed)]);
  return [...keys].every((key) => (expected[key] ?? 0) === (observed[key] ?? 0));
}

export async function restoreBackup(target: DocumentSource & DocumentSink, path: string, passphrase: string): Promise<Counts> {
  requirePassphrase(passphrase);
  for (const collection of Object.values(COLLECTIONS)) {
    if ((await target.page(collection, undefined, 1)).length > 0) {
      throw new BackupError(`destino não está vazio (${collection}); restauração recusada`);
    }
  }
  // First pass authenticates and validates everything, so a bad file never leaves a partial restore.
  await forEachFrame(path, passphrase, (chunk) => verify.feed(chunk));
  const verify = new BackupParser(async () => undefined);
  return counts;
}
