import { cache } from "react";
import { resolveBackendMode } from "../../lib/server/mode";
import { loadFirestoreStore } from "../../lib/server/store";
import { loadEdicao, loadEdicoes, loadLatestEdicao } from "./source";

const source = () => ({ mode: resolveBackendMode(process.env.BACKEND_MODE), getStore: async () => loadFirestoreStore() });

// Request-scoped memo: metadata and page of the same request share one read.
export const getEdicoes = cache(() => loadEdicoes(source()));
export const getLatestEdicao = cache(() => loadLatestEdicao(source()));
export const getEdicao = cache((slug: string) => loadEdicao(slug, source()));
export const isDemoCatalog = () => resolveBackendMode(process.env.BACKEND_MODE) !== "pilot";
