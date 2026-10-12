import type { DocumentSink, DocumentSource, StoredDocument } from "../../../scripts/ops/documents";

// In-memory stand-in for Firestore: ordered paging by ID and batch writes that count calls and reject overwrites.
export function fakeDocuments(seed: Record<string, Record<string, Record<string, unknown>>> = {}) {
  const data = new Map(Object.entries(seed).map(([collection, docs]) => [collection, new Map(Object.entries(docs))]));
  const batches: number[] = [];
  const api: DocumentSource & DocumentSink = {
    async page(collection, afterId, limit): Promise<StoredDocument[]> {
      return [...(data.get(collection) ?? [])]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .filter(([id]) => afterId === undefined || id > afterId)
        .slice(0, limit)
        .map(([id, doc]) => ({ id, data: structuredClone(doc) }));
    },
    async writeAll(entries) {
      batches.push(entries.length);
      for (const entry of entries) {
        const docs = data.get(entry.collection) ?? new Map();
        if (docs.has(entry.id)) throw new Error("already exists");
        docs.set(entry.id, structuredClone(entry.data));
        data.set(entry.collection, docs);
      }
    },
  };
  return { ...api, batches, data };
}
