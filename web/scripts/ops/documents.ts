import { FieldPath, type Firestore } from "firebase-admin/firestore";

export interface StoredDocument {
  id: string;
  data: Record<string, unknown>;
}

export interface DocumentSource {
  // Documents with ID strictly after `afterId` (from the start when undefined), ascending by ID.
  page(collection: string, afterId: string | undefined, limit: number): Promise<StoredDocument[]>;
}

export interface DocumentSink {
  writeAll(entries: readonly { collection: string; id: string; data: Record<string, unknown> }[]): Promise<void>;
}

export const PAGE_SIZE = 500;

export async function* readCollection(source: DocumentSource, collection: string, pageSize = PAGE_SIZE): AsyncGenerator<StoredDocument> {
  let afterId: string | undefined;
  for (;;) {
    const page = await source.page(collection, afterId, pageSize);
    for (const document of page) yield document;
    const last = page[page.length - 1];
    if (page.length < pageSize || !last) return;
    afterId = last.id;
  }
}

export function adminDocuments(db: Firestore): DocumentSource & DocumentSink {
  return {
    async page(collection, afterId, limit) {
      let query = db.collection(collection).orderBy(FieldPath.documentId()).limit(limit);
      if (afterId !== undefined) query = query.startAfter(afterId);
      const snapshot = await query.get();
      return snapshot.docs.map((document) => ({ id: document.id, data: document.data() }));
    },
    async writeAll(entries) {
      const batch = db.batch();
      for (const entry of entries) batch.set(db.collection(entry.collection).doc(entry.id), entry.data);
      await batch.commit();
    },
  };
}
