import { applicationDefault, cert, getApp, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Collection } from "./types";

export interface Tx {
  get<T>(collection: Collection, id: string): Promise<T | undefined>;
  // Documents must not contain `undefined` values (Firestore rejects them).
  set(collection: Collection, id: string, value: object): void;
}

// Reads must precede writes inside `fn`; `fn` may be retried and must not have side effects outside `tx`.
export interface Store {
  transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}

// Transactions are serialized and commit atomically: the contract Firestore gives, for tests.
export function createMemoryStore(): Store & { dump(collection: Collection): Record<string, unknown> } {
  const data = new Map<string, unknown>();
  let tail: Promise<unknown> = Promise.resolve();
  return {
    transaction(fn) {
      const run = tail.then(async () => {
        const writes = new Map<string, unknown>();
        const result = await fn({
          get: async (collection, id) => {
            const key = `${collection}/${id}`;
            const value = writes.has(key) ? writes.get(key) : data.get(key);
            return value === undefined ? undefined : (structuredClone(value) as never);
          },
          set: (collection, id, value) => void writes.set(`${collection}/${id}`, structuredClone(value)),
        });
        for (const [key, value] of writes) data.set(key, value);
        return result;
      });
      tail = run.catch(() => undefined);
      return run;
    },
    dump(collection) {
      return Object.fromEntries(
        [...data]
          .filter(([key]) => key.startsWith(`${collection}/`))
          .map(([key, value]) => [key.slice(collection.length + 1), structuredClone(value)]),
      );
    },
  };
}

interface FsSnapshot { exists: boolean; data(): unknown }
interface FsTransaction { get(ref: unknown): Promise<FsSnapshot>; set(ref: unknown, value: object): unknown }
export interface FirestoreLike {
  collection(name: string): { doc(id: string): unknown };
  runTransaction<T>(fn: (tx: FsTransaction) => Promise<T>): Promise<T>;
}

export function createFirestoreStore(db: FirestoreLike): Store {
  return {
    transaction: (fn) =>
      db.runTransaction((t) =>
        fn({
          get: async (collection, id) => {
            const snapshot = await t.get(db.collection(collection).doc(id));
            return snapshot.exists ? (snapshot.data() as never) : undefined;
          },
          set: (collection, id, value) => void t.set(db.collection(collection).doc(id), value),
        }),
      ),
  };
}

export function loadFirestoreStore(env: Record<string, string | undefined> = process.env): Store {
  const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credential = serviceAccount ? cert(JSON.parse(serviceAccount) as ServiceAccount) : applicationDefault();
  const app = getApps().length ? getApp() : initializeApp({ credential });
  return createFirestoreStore(getFirestore(app));
}
