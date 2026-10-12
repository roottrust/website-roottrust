import { applicationDefault, cert, getApp, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Collection } from "./types";

// Writes are buffered and applied at commit; reads inside `fn` see its own pending writes.
export interface Tx {
  get<T>(collection: Collection, id: string): Promise<T | undefined>;
  // Documents must not contain `undefined` values (Firestore rejects them).
  set(collection: Collection, id: string, value: object): void;
  delete(collection: Collection, id: string): void;
}

// `fn` may be retried and must not have side effects outside `tx`.
export interface Store {
  transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
  // IDs of documents whose `field` is <= `upTo`, ascending (documents without the field are skipped). Not transactional:
  // callers re-read each ID inside a transaction before acting.
  query(collection: Collection, field: string, upTo: string, limit: number): Promise<string[]>;
}

const DELETED = Symbol("deleted");

// Transactions are serialized and commit atomically: the contract Firestore gives, for tests.
export function createMemoryStore(): Store & { dump(collection: Collection): Record<string, unknown> } {
  const data = new Map<string, unknown>();
  let tail: Promise<unknown> = Promise.resolve();
  const entries = (collection: Collection) =>
    [...data].filter(([key]) => key.startsWith(`${collection}/`)).map(([key, value]) => [key.slice(collection.length + 1), value] as const);
  return {
    transaction(fn) {
      const run = tail.then(async () => {
        const writes = new Map<string, unknown>();
        const result = await fn({
          get: async (collection, id) => {
            const key = `${collection}/${id}`;
            const value = writes.has(key) ? writes.get(key) : data.get(key);
            return value === undefined || value === DELETED ? undefined : (structuredClone(value) as never);
          },
          set: (collection, id, value) => void writes.set(`${collection}/${id}`, structuredClone(value)),
          delete: (collection, id) => void writes.set(`${collection}/${id}`, DELETED),
        });
        for (const [key, value] of writes) {
          if (value === DELETED) data.delete(key);
          else data.set(key, value);
        }
        return result;
      });
      tail = run.catch(() => undefined);
      return run;
    },
    async query(collection, field, upTo, limit) {
      return entries(collection)
        .map(([id, value]) => [id, (value as Record<string, unknown>)[field]] as const)
        .filter((entry): entry is readonly [string, string] => typeof entry[1] === "string" && entry[1] <= upTo)
        .sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
        .slice(0, limit)
        .map(([id]) => id);
    },
    dump(collection) {
      return Object.fromEntries(entries(collection).map(([id, value]) => [id, structuredClone(value)]));
    },
  };
}

interface FsSnapshot { exists: boolean; data(): unknown }
interface FsTransaction { get(ref: unknown): Promise<FsSnapshot>; set(ref: unknown, value: object): unknown; delete(ref: unknown): unknown }
interface FsQuery { orderBy(field: string): FsQuery; limit(count: number): FsQuery; get(): Promise<{ docs: { id: string }[] }> }
export interface FirestoreLike {
  collection(name: string): { doc(id: string): unknown; where(field: string, op: "<=", value: unknown): FsQuery };
  runTransaction<T>(fn: (tx: FsTransaction) => Promise<T>): Promise<T>;
}

// Firestore forbids reads after writes in a transaction, so writes are held back until `fn` finishes (and replayed on retry).
export function createFirestoreStore(db: FirestoreLike): Store {
  return {
    transaction: (fn) =>
      db.runTransaction(async (t) => {
        const pending = new Map<string, { collection: Collection; id: string; value: object | undefined }>();
        const queue = (collection: Collection, id: string, value: object | undefined) =>
          void pending.set(`${collection}/${id}`, { collection, id, value: value && structuredClone(value) });
        const result = await fn({
          get: async (collection, id) => {
            const buffered = pending.get(`${collection}/${id}`);
            if (buffered) return buffered.value && (structuredClone(buffered.value) as never);
            const snapshot = await t.get(db.collection(collection).doc(id));
            return snapshot.exists ? (snapshot.data() as never) : undefined;
          },
          set: (collection, id, value) => queue(collection, id, value),
          delete: (collection, id) => queue(collection, id, undefined),
        });
        for (const { collection, id, value } of pending.values()) {
          const ref = db.collection(collection).doc(id);
          if (value) t.set(ref, value);
          else t.delete(ref);
        }
        return result;
      }),
    async query(collection, field, upTo, limit) {
      const snapshot = await db.collection(collection).where(field, "<=", upTo).orderBy(field).limit(limit).get();
      return snapshot.docs.map((doc) => doc.id);
    },
  };
}

export function loadFirestoreStore(env: Record<string, string | undefined> = process.env): Store {
  const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credential = serviceAccount ? cert(JSON.parse(serviceAccount) as ServiceAccount) : applicationDefault();
  const app = getApps().length ? getApp() : initializeApp({ credential });
  return createFirestoreStore(getFirestore(app));
}
